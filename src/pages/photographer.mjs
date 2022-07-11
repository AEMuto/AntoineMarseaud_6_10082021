import { getPhotographers, verifySessionStorage, wait } from '../utils/photographerService.mjs';
import templateFactory from '../components/factory.mjs';

// Enlever la classe preload sur body après chargement de la page
// pour que les transitions se déroulent normalement
window.onload = () => {
  document.querySelector('body').classList.remove('preload');
};

// Récupérer l'ID du photographe
const photographerId = parseInt(
  document.querySelector('meta[name="PhotographerId"]').content, 10,
);

// Initialisation
async function initialize() {
  await verifySessionStorage();

  // Injection des templates **********************************************************************
  // Containers
  const photographerInfoSection = document.querySelector('section.info');
  const gallery = document.querySelector('.gallery__wrapper');

  const lightboxModal = document.querySelector('.modal-lightbox');
  const lightboxMediaContainer = lightboxModal.querySelector('.lightbox__wrapper');

  const contactModal = document.querySelector('.modal-contact');
  const contactPhotographerName = contactModal.querySelector(
    '.modal-contact__form__title',
  );

  // States
  const photographerState = getPhotographers(photographerId);
  const mediaState = photographerState.medias;
  let tempPhotographerState;
  let tempMediaState;

  // Instanciation
  let infoHeader = templateFactory.createInstance(photographerState, 'infoHeader');
  let galleryCardInstances = [];
  let lightboxMediaInstances = [];
  mediaState.forEach((media) => {
    galleryCardInstances.push(templateFactory.createInstance(media, 'card'));
    lightboxMediaInstances.push(templateFactory.createInstance(media, 'lightbox'));
  });
  // Insertion
  photographerInfoSection.insertAdjacentHTML('afterbegin', infoHeader.getTemplate());
  galleryCardInstances.forEach((card) => gallery.insertAdjacentHTML('beforeend', card.getTemplate()));
  contactPhotographerName.insertAdjacentHTML('beforeend', photographerState.name);
  // L'insertion d'images dans la lightbox se fait lors du 'click' sur une image de la galerie

  // Variables post-insertion
  let tags = photographerInfoSection.querySelectorAll('.btn--tag');
  let galleryCards = gallery.querySelectorAll('.card-photo');
  let contactOpenButton = Array.from(document.querySelectorAll('.btn--cta'));

  // Mis à jour de l'état *************************************************************************

  function updateState() {
    // MàJ ne se fait qu'à partir d'un état temporaire
    !tempPhotographerState ? tempPhotographerState = photographerState : '';
    !tempMediaState ? tempMediaState = mediaState : '';
    // Reset de l'html et des instances
    photographerInfoSection.innerHTML = '';
    gallery.innerHTML = '';
    galleryCardInstances = [];
    lightboxMediaInstances = [];
    // Ré-instanciation des templates
    infoHeader = templateFactory.createInstance(tempPhotographerState, 'infoHeader');
    tempMediaState.forEach((media) => {
      galleryCardInstances.push(templateFactory.createInstance(media, 'card'));
      lightboxMediaInstances.push(templateFactory.createInstance(media, 'lightbox'));
    });
    // Ré-insertion des templates
    photographerInfoSection.insertAdjacentHTML('afterbegin', infoHeader.getTemplate());
    galleryCardInstances.forEach((card) => gallery.insertAdjacentHTML('beforeend', card.getTemplate()));
    // Ré-initialisation des variables post-insertions
    tags = photographerInfoSection.querySelectorAll('.btn--tag');
    galleryCards = gallery.querySelectorAll('.card-photo');
    contactOpenButton = Array.from(photographerInfoSection.querySelectorAll('.btn--cta'));
    // Rajout des listeners (ceux de l'état initial sont détruit lors du reset
    tags.forEach((tag) => tag.addEventListener('click', filterMedias));
    galleryCards.forEach((img) => {
      img.addEventListener('click', handleGalleryCardClicks);
    });
    contactOpenButton.forEach((button) => {
      button.addEventListener('click', openContactForm);
    });

    // Garder le focus sur le dernier élément focusé
    const lastFocusedLikeButton = gallery.querySelector('[data-lastfocused="true"]');
    const lastFocusedTagButton = photographerInfoSection.querySelector(
      '[aria-selected="true"]',
    ) ? photographerInfoSection.querySelector('[aria-selected="true"]')
      : photographerInfoSection.querySelector('[data-lastselected="true"]');

    if (lastFocusedLikeButton) {
      lastFocusedLikeButton.focus();
    } else if (lastFocusedTagButton) {
      lastFocusedTagButton.focus();
    } else {
      document.activeElement.focus();
    }
  }

  document.addEventListener('stateChanged', updateState);

  // Accessibility Functions **********************************************************************

  let focusableEls;
  let firstFocusableEl;
  let lastFocusableEl;

  /**
   * Lorsque l'on ouvre une modale on ne doit pouvoir
   * tabulé qu'à travers les éléments de celles-ci.
   * Cette fonction nous obtient ces éléments.
   * 1. Les éléments nécessitent d'avoir un tabindex de 0
   * 2. La gestion des keyboards events est défini dans
   * une fonction indépendante à chaque modale :
   * - handleLightboxKeysBehaviour()
   * - handleContactKeysBehaviour()
   * Se base sur la notion de trapFocus
   * cf: https://hiddedevries.nl/en/blog/2017-01-29-using-javascript-to-trap-focus-in-an-element
   * @param modal
   */
  function getAllowedFocusableElemsIn(modal) {
    const selector = modal.className.split(' ')[0];
    focusableEls = Array.from(modal.querySelectorAll(`.${selector} [tabindex="0"]`));
    firstFocusableEl = focusableEls[0];
    lastFocusableEl = focusableEls[focusableEls.length - 1];
  }

  function toggleAriaExpanded(element) {
    return element.getAttribute('aria-expanded') === 'false'
      ? element.setAttribute('aria-expanded', 'true')
      : element.setAttribute('aria-expanded', 'false');
  }

  function toggleAriaSelected(element) {
    return element.getAttribute('aria-selected') === 'false'
      ? element.setAttribute('aria-selected', 'true')
      : element.setAttribute('aria-selected', 'false');
  }

  function toggleAriaHidden(element) {
    return element.getAttribute('aria-hidden') === 'false'
      ? element.setAttribute('aria-hidden', 'true')
      : element.setAttribute('aria-hidden', 'false');
  }

  function toggleTabindex(element) {
    return element.getAttribute('tabindex') === '0'
      ? element.setAttribute('tabindex', '-1')
      : element.setAttribute('tabindex', '0');
  }

  function toggleFocusableIn(modal) {
    const selector = modal.className.split(' ')[0];
    const elements = Array.from(modal.querySelectorAll(`.${selector} [tabindex]`));
    toggleAriaHidden(modal);
    toggleTabindex(modal);
    elements.forEach((element) => toggleTabindex(element));
  }

  function toggleFocusableOnLightboxMediaContainer() {
    const elements = Array.from(lightboxMediaContainer.querySelectorAll('[tabindex]'));
    elements.forEach((element) => toggleTabindex(element));
  }

  // Gallery's Medias Sorting *********************************************************************

  const sortingButton = document.querySelector('.btn--dropdown');
  const sortingMenu = document.querySelector('.dropdown');
  const sortingMenuOptions = Array.from(sortingMenu.querySelectorAll('[role="option"]'));

  let selectedSort = 'popularity';

  function toggleDropdown() {
    sortingMenu.hidden = !sortingMenu.hidden;
    toggleAriaExpanded(sortingButton);
    sortingMenu.focus();
    setTimeout(() => {
      document.addEventListener('click', outsideClick);
    }, 10);
    setTimeout(() => {
      sortingMenu.addEventListener('keydown', cycleThroughOptions);
    }, 10);
  }

  function cycleThroughOptions(e) {
    let index;
    switch (e.key) {
      case 'Tab':
        sortingMenu.hidden = !sortingMenu.hidden;
        toggleAriaExpanded(sortingButton);
        galleryCards[0].focus();
        sortingMenu.removeEventListener('keydown', cycleThroughOptions);
        document.removeEventListener('click', outsideClick);
        break;
      case 'Escape':
        sortingMenu.hidden = !sortingMenu.hidden;
        toggleAriaExpanded(sortingButton);
        sortingButton.focus();
        sortingMenu.removeEventListener('keydown', cycleThroughOptions);
        document.removeEventListener('click', outsideClick);
        break;
      case 'Enter':
        e.preventDefault();
        sortingButton.firstChild.textContent = selectedSort;
        sortMedia(selectedSort);
        sortingMenu.hidden = !sortingMenu.hidden;
        toggleAriaExpanded(sortingButton);
        sortingButton.focus();
        sortingMenu.removeEventListener('keydown', cycleThroughOptions);
        document.removeEventListener('click', outsideClick);
        break;
      case ' ': // Space
        e.preventDefault();
        sortingButton.firstChild.textContent = selectedSort;
        sortMedia(selectedSort);
        sortingMenu.hidden = !sortingMenu.hidden;
        toggleAriaExpanded(sortingButton);
        sortingButton.focus();
        sortingMenu.removeEventListener('keydown', cycleThroughOptions);
        document.removeEventListener('click', outsideClick);
        break;
      case 'ArrowDown':
        e.preventDefault();
        index = sortingMenuOptions.findIndex(
          (option) => option.getAttribute('aria-selected') === 'true',
        );
        toggleAriaSelected(sortingMenuOptions[index]);
        index++;
        if (index > sortingMenuOptions.length - 1) {
          index = 0;
        }
        toggleAriaSelected(sortingMenuOptions[index]);
        sortingMenuOptions[index].focus();
        selectedSort = sortingMenuOptions[index].id;
        sortingMenu.setAttribute('aria-activedescendant', selectedSort);
        break;
      case 'ArrowUp':
        e.preventDefault();
        index = sortingMenuOptions.findIndex(
          (option) => option.getAttribute('aria-selected') === 'true',
        );
        toggleAriaSelected(sortingMenuOptions[index]);
        index--;
        if (index < 0) {
          index = sortingMenuOptions.length - 1;
        }
        toggleAriaSelected(sortingMenuOptions[index]);
        sortingMenuOptions[index].focus();
        selectedSort = sortingMenuOptions[index].id;
        sortingMenu.setAttribute('aria-activedescendant', selectedSort);
        break;
      default:
        break;
    }
  }

  function outsideClick(e) {
    const isOutside = !e.target.closest('.dropdown');
    if (isOutside) {
      sortingMenu.hidden = !sortingMenu.hidden;
      toggleAriaExpanded(sortingButton);
      document.removeEventListener('click', outsideClick);
      sortingMenu.removeEventListener('keydown', cycleThroughOptions);
    }
    document.removeEventListener('click', outsideClick);
    sortingMenu.removeEventListener('keydown', cycleThroughOptions);
  }

  function compareNum(current, next, order = 'descending') {
    if (order === 'descending') { return next - current; }
    if (order === 'ascending') { return current - next; }
    throw new Error('Invalid order parameter');
  }

  function compareText(current, next, order = 'descending') {
    if (order === 'descending') {
      if (current > next) { return 1; }
      if (next > current) { return -1; }
      return 0;
    }
    if (order === 'ascending') {
      if (current < next) { return 1; }
      if (next < current) { return -1; }
      return 0;
    }
    throw new Error('Invalid order parameter');
  }

  function sortMedia(sortBy) {
    !tempMediaState ? tempMediaState = mediaState : '';
    switch (sortBy) {
      case 'Popularité':
        tempMediaState.sort((a, b) => compareNum(a.likes, b.likes));
        document.dispatchEvent(new CustomEvent('stateChanged'));
        break;
      case 'Date':
        tempMediaState.sort((a, b) => compareText(a.date, b.date, 'ascending'));
        document.dispatchEvent(new CustomEvent('stateChanged'));
        break;
      case 'Titre':
        tempMediaState.sort((a, b) => compareText(a.title, b.title));
        document.dispatchEvent(new CustomEvent('stateChanged'));
        break;
      default:
        tempMediaState.sort((a, b) => compareNum(a.likes, b.likes));
        document.dispatchEvent(new CustomEvent('stateChanged'));
        break;
    }
  }

  function handleClickOptions(e) {
    sortingMenuOptions.forEach((option) => {
      option.setAttribute('aria-selected', 'false');
    });
    e.currentTarget.setAttribute('aria-selected', 'true');
    sortingButton.firstChild.textContent = e.currentTarget.textContent;
    selectedSort = e.currentTarget.id;
    sortMedia(selectedSort);
    sortingMenu.hidden = !sortingMenu.hidden;
    toggleAriaExpanded(sortingButton);
    sortingButton.focus();
  }

  sortingButton.addEventListener('click', toggleDropdown);

  sortingMenuOptions.forEach((option) => {
    option.addEventListener('click', handleClickOptions);
  });

  // Gallery's Medias Filtering *******************************************************************

  let filteredBy;

  function filterMedias(e) {
    mediaState.forEach((media) => (media.lastFocused = false));
    const tagValue = e.currentTarget.dataset.value;
    tags.forEach((tag) => tag.setAttribute('aria-selected', 'false'));
    if (!filteredBy || filteredBy !== tagValue) {
      e.currentTarget.setAttribute('aria-selected', 'true');
      filteredBy = tagValue;
      if (!tempMediaState && !tempPhotographerState) {
        tempMediaState = mediaState.filter((media) => media.tags.includes(tagValue));
        tempPhotographerState = photographerState;
        tempPhotographerState.selectedTag = tagValue;
        document.dispatchEvent(new CustomEvent('stateChanged'));
      } else {
        tempMediaState = mediaState;
        sortMedia(selectedSort);
        tempMediaState = tempMediaState.filter((media) => media.tags.includes(tagValue));
        tempPhotographerState.selectedTag = tagValue;
        document.dispatchEvent(new CustomEvent('stateChanged'));
      }
    } else {
      e.currentTarget.setAttribute('aria-selected', 'false');
      filteredBy = undefined;
      photographerState.selectedTag = '';
      photographerState.lastSelectedTag = tagValue;
      tempPhotographerState = photographerState;
      tempMediaState = mediaState;
      sortMedia(selectedSort);
      document.dispatchEvent(new CustomEvent('stateChanged'));
    }
  }

  tags.forEach((tag) => tag.addEventListener('click', filterMedias));

  // Gallery Cards Behaviour (openLightBox || incrementLike) **************************************

  const lightboxCloseButton = lightboxModal.querySelector('.btn--close');
  const lightboxPrevButton = lightboxModal.querySelector('.btn--prev');
  const lightboxNextButton = lightboxModal.querySelector('.btn--next');

  let lastGalleryCardFocused;

  function selectMedia(id) {
    const index = lightboxMediaInstances.findIndex((media) => media.id === id);
    lightboxMediaInstances[index].currentMedia = true;
    lightboxMediaInstances[index + 1]
      ? (lightboxMediaInstances[index + 1].nextMedia = true)
      : (lightboxMediaInstances[0].nextMedia = true);
    lightboxMediaInstances[index - 1]
      ? (lightboxMediaInstances[index - 1].prevMedia = true)
      : (lightboxMediaInstances[lightboxMediaInstances.length - 1].prevMedia = true);
    return lightboxMediaInstances[index].getTemplate();
  }

  function resetMedias() {
    lightboxMediaInstances.forEach((media) => {
      media.currentMedia = false;
      media.prevMedia = false;
      media.nextMedia = false;
    });
  }

  async function nextMedia() {
    const { id } = lightboxMediaInstances.find((media) => media.nextMedia);
    resetMedias();
    lightboxMediaContainer.innerHTML = selectMedia(id);
    await wait(10);
    toggleFocusableOnLightboxMediaContainer();
    getAllowedFocusableElemsIn(lightboxModal);
    lightboxMediaContainer.querySelector('img')
      ? setTimeout(() => lightboxMediaContainer.querySelector('img').focus(), 50)
      : setTimeout(() => lightboxMediaContainer.querySelector('video').focus(), 50);
  }

  async function prevMedia() {
    const { id } = lightboxMediaInstances.find((media) => media.prevMedia);
    resetMedias();
    lightboxMediaContainer.innerHTML = selectMedia(id);
    await wait(10);
    toggleFocusableOnLightboxMediaContainer();
    getAllowedFocusableElemsIn(lightboxModal);
    lightboxMediaContainer.querySelector('img')
      ? setTimeout(() => lightboxMediaContainer.querySelector('img').focus(), 50)
      : setTimeout(() => lightboxMediaContainer.querySelector('video').focus(), 50);
  }

  async function closeLightbox() {
    lightboxMediaContainer.innerHTML = '';
    resetMedias();
    toggleFocusableIn(lightboxModal);
    lightboxModal.classList.remove('open');
    await wait(10);
    lastGalleryCardFocused.focus();
    lightboxModal.removeEventListener('keydown', handleLightboxKeysBehaviour);
  }

  function openLightbox(e) {
    const mediaId = parseInt(e.currentTarget.dataset.id, 10);
    lightboxMediaContainer.innerHTML = selectMedia(mediaId);
    setTimeout(() => {
      lightboxMediaContainer.firstElementChild.classList.add('loaded');
    }, 10);
    lightboxModal.classList.add('open');
    toggleFocusableIn(lightboxModal);
    getAllowedFocusableElemsIn(lightboxModal);
    lightboxModal.focus();
    lightboxModal.addEventListener('keydown', handleLightboxKeysBehaviour);
  }

  function incrementLike(e) {
    const mediaId = parseInt(e.currentTarget.dataset.id, 10);
    mediaState.forEach((media) => (media.lastFocused = false));
    const currentMedia = mediaState.find((media) => media.id === mediaId);
    if (currentMedia.liked) {
      currentMedia.lastFocused = true;
      currentMedia.liked = !currentMedia.liked;
      currentMedia.likes -= 1;
      photographerState.likes--;
      document.dispatchEvent(new CustomEvent('stateChanged'));
    } else {
      currentMedia.lastFocused = true;
      currentMedia.liked = !currentMedia.liked;
      currentMedia.likes += 1;
      photographerState.likes++;
      document.dispatchEvent(new CustomEvent('stateChanged'));
    }
  }

  function handleGalleryCardClicks(e) {
    e.preventDefault();
    if (e.target.dataset.behaviour === 'openLightbox') {
      lastGalleryCardFocused = e.target;
      openLightbox(e);
    }
    if (e.target.dataset.behaviour === 'incrementLike') {
      incrementLike(e);
    }
  }

  function handleLightboxKeysBehaviour(e) {
    const isTabPressed = e.key === 'Tab';
    if (!isTabPressed) {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (e.target.className.includes('btn--close')) {
            closeLightbox();
          }
          if (e.target.className.includes('btn--prev')) {
            prevMedia();
          }
          if (e.target.className.includes('btn--next')) {
            nextMedia();
          }
          break;
        case 'Escape':
          closeLightbox();
          e.preventDefault();
          break;
        case 'ArrowLeft':
          prevMedia();
          e.preventDefault();
          break;
        case 'ArrowRight':
          nextMedia();
          e.preventDefault();
          break;
        default:
          break;
      }
    }
    if (e.shiftKey) {
      /* shift + tab */ if (document.activeElement === firstFocusableEl) {
        lastFocusableEl.focus();
        e.preventDefault();
      }
    } /* tab */ else if (document.activeElement === lastFocusableEl) {
      firstFocusableEl.focus();
      e.preventDefault();
    }
  }

  galleryCards.forEach((img) => {
    img.addEventListener('click', handleGalleryCardClicks);
  });

  lightboxCloseButton.addEventListener('click', closeLightbox);
  lightboxNextButton.addEventListener('click', nextMedia);
  lightboxPrevButton.addEventListener('click', prevMedia);

  // Contact Modal ********************************************************************************

  const contactModalForm = contactModal.querySelector('.modal-contact__form');
  const contactModalFormInputs = contactModalForm.querySelectorAll(
    '[type="text"], [type="email"]',
  );
  const contactSubmitButton = contactModalForm.querySelector('.btn--submit');
  const contactCloseButton = contactModal.querySelector('.btn--close');

  let currentContactOpenButton;
  const clientInputs = {
    firstname: '',
    lastname: '',
    email: '',
    message: '',
  };

  function openContactForm(e) {
    currentContactOpenButton = e.target;
    contactModal.classList.add('open');
    toggleFocusableIn(contactModal);
    contactModal.focus();
    getAllowedFocusableElemsIn(contactModal);
    contactModal.addEventListener('keydown', handleContactKeysBehaviour);
  }

  function closeContactForm() {
    toggleFocusableIn(contactModal);
    contactModal.classList.remove('open');
    currentContactOpenButton.focus();
    contactModal.removeEventListener('keydown', handleContactKeysBehaviour);
  }

  function handleContactKeysBehaviour(e) {
    const isTabPressed = e.key === 'Tab';
    if (!isTabPressed) {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (e.target.nodeName === 'INPUT' || e.target.nodeName === 'TEXTAREA') {
            handleSubmit();
          }
          if (e.target.className.includes('btn--close')) {
            closeContactForm();
          }
          break;
        case 'Escape':
          e.preventDefault();
          closeContactForm();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          break;
        case 'ArrowRight':
          e.preventDefault();
          break;
        case 'ArrowDown':
          e.preventDefault();
          break;
        case 'ArrowUp':
          e.preventDefault();
          break;
        default:
          break;
      }
    }
    if (e.shiftKey) {
      /* shift + tab */ if (document.activeElement === firstFocusableEl) {
        lastFocusableEl.focus();
        e.preventDefault();
      }
    } /* tab */ else if (document.activeElement === lastFocusableEl) {
      firstFocusableEl.focus();
      e.preventDefault();
    }
  }

  function handleSubmit() {
    contactModalFormInputs.forEach((input) => (input.value = ''));
    setTimeout(() => closeContactForm(), 250);
  }

  function handleClientInput(e) {
    switch (e.target.id) {
      case 'firstname':
        clientInputs.firstname = e.target.value;
        break;
      case 'lastname':
        clientInputs.lastname = e.target.value;
        break;
      case 'email':
        clientInputs.email = e.target.value;
        break;
      case 'message':
        clientInputs.message = e.target.value;
        break;
      default:
        throw new Error('Wrong Input');
    }
  }

  contactOpenButton.forEach((button) => {
    button.addEventListener('click', openContactForm);
  });

  contactCloseButton.addEventListener('click', closeContactForm);

  contactModal.addEventListener('click', (e) => {
    e.preventDefault();
    const isOutside = !e.target.closest('.modal-contact__form');
    return isOutside && closeContactForm();
  });

  contactModalFormInputs.forEach((input) => input.addEventListener('change', handleClientInput));

  contactModalForm.addEventListener('submit', handleSubmit);

  contactSubmitButton.addEventListener('click', handleSubmit);

  // Intersection observer pour fonctionnalité du bouton "Remonter" *******************************
  // ! fonctionnalité indisponible pour les possesseurs de lecteur d'écran !
  const scrollToTopContainer = document.querySelector('.scrollToTop-container');
  const scrollToTopButton = scrollToTopContainer.querySelector('.btn--scrollToTop');

  function scrollToTop(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        scrollToTopButton.classList.remove('visible');
      } else {
        scrollToTopButton.classList.add('visible');
      }
    });
  }

  const scrollToTopObserver = new IntersectionObserver(scrollToTop, {
    root: null,
    threshold: 0,
  });

  scrollToTopObserver.observe(scrollToTopContainer);

  scrollToTopButton.addEventListener('click', () => {
    scrollToTopContainer.focus();
  });
}

initialize();
