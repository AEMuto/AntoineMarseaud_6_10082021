import { getPhotographers, verifySessionStorage } from "../utils/photographerService.mjs";
import { makeInfoHeader } from "../components/photographerInfoHeader.mjs";
import { makeMediaCard, makeMediaLightbox, templateFactory } from "../components/mediaCard.mjs";

// Enlever la classe preload sur body après chargement de la page
// pour que les transitions se déroulent normalement
window.onload = () => {
  document.querySelector("body").classList.remove("preload");
};

// Récupérer l'ID du photographe
const photographerId = parseInt(
  document.querySelector('meta[name="PhotographerId"]').content
);

// Initialisation
async function initialize() {
  await verifySessionStorage();

  // Injection des templates **********************************************************************
  // Containers
  const photographerInfoSection = document.querySelector("section.info");
  const gallery = document.querySelector(".gallery__wrapper");

  const lightboxModal = document.querySelector(".modal-lightbox");
  const lightboxMediaContainer = lightboxModal.querySelector(".item");

  const contactModal = document.querySelector(".modal-contact");
  const contactPhotographerName = contactModal.querySelector(".modal-contact__form__title");

  // States
  let photographerState = getPhotographers(photographerId);
  let mediaState = photographerState.medias;
  let tempPhotographerState;
  let tempMediaState;

  // Instanciation
  let infoHeader = templateFactory.createInstance(photographerState, 'infoHeader');
  let galleryCardInstances = [];
  let lightboxMediaInstances = [];
  mediaState.forEach(media => {
    galleryCardInstances.push(templateFactory.createInstance(media, 'card'));
    lightboxMediaInstances.push(templateFactory.createInstance(media, 'lightbox'))
  });

  // Insertion
  photographerInfoSection.insertAdjacentHTML("afterbegin", infoHeader.getTemplate());
  galleryCardInstances.forEach(card =>
    gallery.insertAdjacentHTML("beforeend", card.getTemplate())
  );
  contactPhotographerName.insertAdjacentHTML("beforeend", photographerState.name);
  // L'insertion d'images dans la lightbox se fait lors du 'click' sur une image de la gallerie

  // Variables post-insertion
  let tags = photographerInfoSection.querySelectorAll(".btn--tag");
  let galleryCards = gallery.querySelectorAll(".card-photo");

  // Mis à jour de l'état *************************************************************************

  function updateState() {

    if (!tempPhotographerState) {
      tempPhotographerState = photographerState;
    }
    if (!tempMediaState) {
      tempMediaState = mediaState;
    }

    photographerInfoSection.innerHTML = "";
    gallery.innerHTML = "";
    galleryCardInstances = [];
    lightboxMediaInstances = [];

    infoHeader = templateFactory.createInstance(tempPhotographerState, 'infoHeader');
    tempMediaState.forEach(media => {
      galleryCardInstances.push(templateFactory.createInstance(media, 'card'));
      lightboxMediaInstances.push(templateFactory.createInstance(media, 'lightbox'))
    });

    photographerInfoSection.insertAdjacentHTML("afterbegin", infoHeader.getTemplate());
    galleryCardInstances.forEach(card =>
      gallery.insertAdjacentHTML("beforeend", card.getTemplate())
    );

    tags = photographerInfoSection.querySelectorAll(".btn--tag");
    galleryCards = gallery.querySelectorAll(".card-photo");

    tags.forEach((tag) => tag.addEventListener("click", filterMedias));
    galleryCards.forEach((img) => {
      img.addEventListener("click", handleGalleryCardClicks);
    });

  }

  document.addEventListener("stateChanged", updateState);

  // Accessibility Functions ****************************************************************************

  let focusableEls;
  let firstFocusableEl;
  let lastFocusableEl;

  function addTrapFocus(element) {
    const selector = element.className.split(' ')[0];
    focusableEls = Array.from(element.querySelectorAll(`.${selector} [tabindex="0"]`));
    // console.log(focusableEls);
    firstFocusableEl = focusableEls[0];
    lastFocusableEl = focusableEls[focusableEls.length - 1];
    if (selector === 'modal-contact') {
      element.addEventListener('keydown', handleContactKeysBehaviour);
    }
    if (selector === 'modal-lightbox') {
      element.addEventListener('keydown', handleLightboxKeysBehaviour);
    }
  }

  function removeTrapFocus(element) {
    if (element.className === 'modal-contact') {
      element.removeEventListener('keydown', handleContactKeysBehaviour);
    }
    if (element.className === 'modal-lightbox') {
      element.removeEventListener('keydown', handleLightboxKeysBehaviour);
    }
  }

  function toggleAriaExpanded(element) {
    return element.getAttribute("aria-expanded") === "false"
      ? element.setAttribute("aria-expanded", "true")
      : element.setAttribute("aria-expanded", "false");
  }

  function toggleAriaSelected(element) {
    return element.getAttribute("aria-selected") === "false"
      ? element.setAttribute("aria-selected", "true")
      : element.setAttribute("aria-selected", "false");
  }

  function toggleAriaHidden(element) {
    return element.getAttribute("aria-hidden") === "false"
      ? element.setAttribute("aria-hidden", "true")
      : element.setAttribute("aria-hidden", "false");
  }

  function toggleTabindex(element) {
    return element.getAttribute("tabindex") === "0"
      ? element.setAttribute("tabindex", "-1")
      : element.setAttribute("tabindex", "0");
  }

  function toggleFocusable(element) {
    const selector = element.className.split(' ')[0];
    const elements = Array.from(element.querySelectorAll(`.${selector} [tabindex="-1"]`));
    toggleAriaHidden(element);
    toggleTabindex(element);
    elements.forEach(element => toggleTabindex(element));
  }

  // Gallery's Medias Sorting *********************************************************************

  const sortingButton = document.querySelector(".btn--dropdown");
  const sortingMenu = document.querySelector(".dropdown");
  const sortingMenuOptions = Array.from(sortingMenu.querySelectorAll('[role="option"]'));

  let selectedSort = "popularity";
  let dropdownVisible = false;

  function toggleDropdown() {
    dropdownVisible = !dropdownVisible;
    sortingMenu.hidden = !sortingMenu.hidden;
    toggleAriaExpanded(sortingButton);
    sortingMenu.focus();
    setTimeout(() => {
      document.addEventListener("click", outsideClick);
    }, 10);
    setTimeout(() => {
      sortingMenu.addEventListener("keydown", cycleThroughOptions);
    }, 10);
  }

  function cycleThroughOptions(e) {
    let index;
    console.log(e.key);
    switch (e.key) {
      case "Tab":
        dropdownVisible = !dropdownVisible;
        sortingMenu.hidden = !sortingMenu.hidden;
        toggleAriaExpanded(sortingButton);
        galleryCards[0].focus();
        sortingMenu.removeEventListener("keydown", cycleThroughOptions);
        document.removeEventListener("click", outsideClick);
        break;
      case "Escape":
        dropdownVisible = !dropdownVisible;
        sortingMenu.hidden = !sortingMenu.hidden;
        toggleAriaExpanded(sortingButton);
        sortingButton.focus();
        sortingMenu.removeEventListener("keydown", cycleThroughOptions);
        document.removeEventListener("click", outsideClick);
        break;
      case "Enter":
        e.preventDefault();
        sortingButton.firstChild.textContent = selectedSort;
        sortMedia(selectedSort);
        dropdownVisible = !dropdownVisible;
        sortingMenu.hidden = !sortingMenu.hidden;
        toggleAriaExpanded(sortingButton);
        sortingButton.focus();
        sortingMenu.removeEventListener("keydown", cycleThroughOptions);
        document.removeEventListener("click", outsideClick);
        break;
      case " ": // Space
        e.preventDefault();
        sortingButton.firstChild.textContent = selectedSort;
        sortMedia(selectedSort);
        dropdownVisible = !dropdownVisible;
        sortingMenu.hidden = !sortingMenu.hidden;
        toggleAriaExpanded(sortingButton);
        sortingButton.focus();
        sortingMenu.removeEventListener("keydown", cycleThroughOptions);
        document.removeEventListener("click", outsideClick);
        break;
      case "ArrowDown":
        e.preventDefault();
        index = sortingMenuOptions.findIndex(option => option.getAttribute('aria-selected') === 'true');
        toggleAriaSelected(sortingMenuOptions[index]);
        index++;
        if (index > sortingMenuOptions.length - 1) { index = 0 }
        toggleAriaSelected(sortingMenuOptions[index]);
        sortingMenuOptions[index].focus();
        selectedSort = sortingMenuOptions[index].id;
        sortingMenu.setAttribute('aria-activedescendant', selectedSort);
        break;
      case "ArrowUp":
        e.preventDefault();
        index = sortingMenuOptions.findIndex(option => option.getAttribute('aria-selected') === 'true');
        toggleAriaSelected(sortingMenuOptions[index]);
        index--;
        if (index < 0) { index = sortingMenuOptions.length - 1 }
        toggleAriaSelected(sortingMenuOptions[index]);
        sortingMenuOptions[index].focus();
        selectedSort = sortingMenuOptions[index].id;
        sortingMenu.setAttribute('aria-activedescendant', selectedSort);
        break;
      default:
        console.log(e.key);
    }
  }

  function outsideClick(e) {
    const isOutside = !e.target.closest(".dropdown");
    if (isOutside) {
      dropdownVisible = !dropdownVisible;
      sortingMenu.hidden = !sortingMenu.hidden;
      toggleAriaExpanded(sortingButton);
      // sortingMenu.tabIndex = -1;
      document.removeEventListener("click", outsideClick);
      sortingMenu.removeEventListener("keydown", cycleThroughOptions);
    }
    document.removeEventListener("click", outsideClick);
    sortingMenu.removeEventListener("keydown", cycleThroughOptions);
  }

  function sortMedia(sortBy) {
    switch (sortBy) {
      case "Popularité":
        if(tempMediaState) {
          tempMediaState.sort((a, b) => b.likes - a.likes);
          document.dispatchEvent(new CustomEvent("stateChanged"));
          break;
        }
        tempMediaState = mediaState;
        tempMediaState.sort((a, b) => b.likes - a.likes);
        document.dispatchEvent(new CustomEvent("stateChanged"));
        break;
      case "Date":
        if(tempMediaState) {
          tempMediaState.sort((a, b) => a.date < b.date ? 1 : b.date < a.date ? -1 : 0);
          document.dispatchEvent(new CustomEvent("stateChanged"));
          break;
        }
        tempMediaState = mediaState;
        tempMediaState.sort((a, b) => a.date < b.date ? 1 : b.date < a.date ? -1 : 0);
        document.dispatchEvent(new CustomEvent("stateChanged"));
        break;
      case "Titre":
        if (tempMediaState) {
          tempMediaState.sort((a, b) => a.title > b.title ? 1 : b.title > a.title ? -1 : 0);
          document.dispatchEvent(new CustomEvent("stateChanged"));
          break;
        }
        tempMediaState = mediaState;
        tempMediaState.sort((a, b) => a.title > b.title ? 1 : b.title > a.title ? -1 : 0);
        document.dispatchEvent(new CustomEvent("stateChanged"));
        break;
      default:
        if(tempMediaState) {
          tempMediaState.sort((a, b) => b.likes - a.likes);
          document.dispatchEvent(new CustomEvent("stateChanged"));
          break;
        }
        tempMediaState = mediaState;
        tempMediaState.sort((a, b) => b.likes - a.likes);
        document.dispatchEvent(new CustomEvent("stateChanged"));
        break;
    }
  }

  function handleClickOptions(e) {
    sortingMenuOptions.forEach(option => {
      option.setAttribute("aria-selected", "false");
    });
    e.currentTarget.setAttribute("aria-selected", "true");
    sortingButton.firstChild.textContent = e.currentTarget.textContent;
    selectedSort = e.currentTarget.id;
    sortMedia(selectedSort);
    dropdownVisible = !dropdownVisible;
    sortingMenu.hidden = !sortingMenu.hidden;
    toggleAriaExpanded(sortingButton);
  }

  sortingButton.addEventListener("click", toggleDropdown);

  sortingMenuOptions.forEach((option) => {
    option.addEventListener("click", handleClickOptions);
  });

  // Gallery's Medias Filtering *******************************************************************

  let filteredBy;

  function filterMedias(e) {
    const tagValue = e.currentTarget.dataset.value;
    tags.forEach(tag => tag.setAttribute('aria-selected', 'false'));
    if (!filteredBy || filteredBy !== tagValue) {
      e.currentTarget.setAttribute('aria-selected', 'true');
      filteredBy = tagValue;
      if (!tempMediaState && !tempPhotographerState) {
        tempMediaState = mediaState.filter((media) => media.tags.includes(tagValue));
        tempPhotographerState = photographerState;
        tempPhotographerState.selectedTag = tagValue;
        document.dispatchEvent(new CustomEvent("stateChanged"));
      } else {
        tempMediaState = mediaState;
        sortMedia(selectedSort);
        tempMediaState = tempMediaState.filter((media) => media.tags.includes(tagValue));
        tempPhotographerState.selectedTag = tagValue;
        document.dispatchEvent(new CustomEvent("stateChanged"));
      }
    } else {

      e.currentTarget.setAttribute('aria-selected', 'false');
      filteredBy = undefined;
      photographerState.selectedTag = '';
      tempPhotographerState = photographerState;
      tempMediaState = mediaState;
      sortMedia(selectedSort);
      document.dispatchEvent(new CustomEvent("stateChanged"));
    }
  }

  tags.forEach((tag) => tag.addEventListener("click", filterMedias));

  // Gallery Cards Behaviour (openLightBox || incrementLike) **************************************

  const lightboxCloseButton = lightboxModal.querySelector(".btn--close");
  const lightboxPrevButton = lightboxModal.querySelector(".btn--prev");
  const lightboxNextButton = lightboxModal.querySelector(".btn--next");

  let selectedMedia;

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

  function nextMedia() {
    const id = lightboxMediaInstances.find((media) => media.nextMedia).id;
    resetMedias();
    lightboxMediaContainer.innerHTML = selectMedia(id);
  }

  function prevMedia() {
    const id = lightboxMediaInstances.find((media) => media.prevMedia).id;
    resetMedias();
    lightboxMediaContainer.innerHTML = selectMedia(id);
  }

  function closeLightbox() {
    resetMedias();
    toggleFocusable(lightboxModal);
    lightboxModal.focus();
    addTrapFocus(lightboxModal);
    lightboxModal.classList.remove("open");
    selectedMedia.focus();
  }

  function openLightbox(e) {
    const mediaId = parseInt(e.currentTarget.dataset.id);
    lightboxMediaContainer.innerHTML = selectMedia(mediaId);
    lightboxModal.classList.add("open");
    toggleFocusable(lightboxModal);
    lightboxModal.focus();
    addTrapFocus(lightboxModal);
  }

  function incrementLike(e) {
    const mediaId = parseInt(e.currentTarget.dataset.id);
    const media = mediaState.find((media) => media.id === mediaId);
    if (media.liked) {
      media.liked = !media.liked;
      media.likes -= 1;
      photographerState.likes--;
      document.dispatchEvent(new CustomEvent("stateChanged"));
    } else {
      media.liked = !media.liked;
      media.likes += 1;
      photographerState.likes++;
      document.dispatchEvent(new CustomEvent("stateChanged"));
    }
  }

  function handleGalleryCardClicks(e) {
    e.preventDefault();
    if (e.target.dataset.behaviour === "openLightbox") {
      selectedMedia = e.target;
      openLightbox(e);
    }
    if (e.target.dataset.behaviour === "incrementLike") {
      incrementLike(e);
    }
  }

  function handleLightboxKeysBehaviour(e) {
    const isTabPressed = (e.key === 'Tab');
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
          e.preventDefault();
          closeLightbox();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevMedia();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextMedia();
          break;
        default:
          console.log(e.key);
      }
    }
    if (e.shiftKey) /* shift + tab */ {
      if (document.activeElement === firstFocusableEl) {
        lastFocusableEl.focus();
        e.preventDefault();
      }
    } else /* tab */ {
      if (document.activeElement === lastFocusableEl) {
        firstFocusableEl.focus();
        e.preventDefault();
      }
    }
  }

  galleryCards.forEach((img) => {
    img.addEventListener("click", handleGalleryCardClicks);
  });

  lightboxCloseButton.addEventListener("click", closeLightbox);
  lightboxNextButton.addEventListener("click", nextMedia);
  lightboxPrevButton.addEventListener("click", prevMedia);

  // Contact Modal ********************************************************************************

  const contactOpenButton = Array.from(document.querySelectorAll(".btn--cta"));
  const contactModalForm = contactModal.querySelector('.modal-contact__form');
  const contactModalFormInputs = contactModalForm.querySelectorAll('[type="text"], [type="email"]');
  const contactSubmitButton = contactModalForm.querySelector(".btn--submit");
  const contactCloseButton = contactModal.querySelector(".btn--close");

  let currentContactOpenButton;
  let clientInputs = {
    firstname: '',
    lastname: '',
    email: '',
    message: ''
  }

  function openContactForm(e) {
    currentContactOpenButton = e.target;
    contactModal.classList.add("open");
    toggleFocusable(contactModal);
    contactModal.focus();
    addTrapFocus(contactModal);
  }

  function closeContactForm() {
    toggleFocusable(contactModal);
    removeTrapFocus(contactModal);
    contactModal.classList.remove("open");
    currentContactOpenButton.focus();
  }

  function handleContactKeysBehaviour(e) {
    const isTabPressed = (e.key === 'Tab');
    if (!isTabPressed) {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (e.target.nodeName === 'INPUT' || e.target.nodeName === 'TEXTAREA') {
            handleSubmit();
          }
          if(e.target.className.includes('btn--close')) {
            console.log('Close Contact Form!');
            closeContactForm();
          }
          break;
        case 'Escape':
          e.preventDefault();
          closeContactForm();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          console.log('ArrowLeft pressed');
          break;
        case 'ArrowRight':
          e.preventDefault();
          console.log('ArrowRight pressed');
          break;
        case 'ArrowDown':
          e.preventDefault();
          console.log('ArrowDown pressed');
          break;
        case 'ArrowUp':
          e.preventDefault();
          console.log('ArrowUp pressed');
          break;
        default:
          console.log(e.key);
      }
    }
    if (e.shiftKey) /* shift + tab */ {
      if (document.activeElement === firstFocusableEl) {
        lastFocusableEl.focus();
        e.preventDefault();
      }
    } else /* tab */ {
      if (document.activeElement === lastFocusableEl) {
        firstFocusableEl.focus();
        e.preventDefault();
      }
    }
  }

  function handleSubmit() {
    console.log(clientInputs);
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
        console.log('Wrong Input');
    }
  }

  contactOpenButton.forEach((button) => {
    button.addEventListener("click", openContactForm);
  });

  contactCloseButton.addEventListener("click", closeContactForm);

  contactModal.addEventListener("click", (e) => {
    e.preventDefault();
    const isOutside = !e.target.closest(".modal-contact__form");
    return isOutside && closeContactForm();
  });

  contactModalFormInputs.forEach(input => input.addEventListener('change', handleClientInput));

  contactModalForm.addEventListener('submit', handleSubmit);

  contactSubmitButton.addEventListener('click', handleSubmit);

}

initialize();
