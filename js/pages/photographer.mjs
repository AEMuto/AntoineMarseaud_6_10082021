import { getPhotographers, verifySessionStorage } from "../utils/photographerService.mjs";
import { makeInfoHeader } from "../components/photographerInfoHeader.mjs";
import { makeMediaCard, makeLightboxMedia } from "../components/mediaCard.mjs";

// Enlever la classe preload sur body après chargement de la page
// pour que les transitions se déroulent normalement
window.onload = () => {
  document.querySelector("body").classList.remove("preload");
};

// Récupérer l'ID du photographe
const photographerId = parseInt(
  document.querySelector('meta[name="PhotographerId"]').content
);

// Containers dans lesquels on injecte les templates
const photographerInfoContainer = document.querySelector("section.info");
const mediaContainer = document.querySelector(".gallery__wrapper");

let photographerState;
let mediaState;
let galleryImages;

let tags;


function getOutsideFocusableElements() {
  const selectors = `header a, header button, header [tabindex="0"], main a, main button, main [tabindex="0"]`;
  return Array.from(document.querySelectorAll(selectors));
}

function getInsideFocusableElements(modalName) {
  const selector = `.${modalName} [tabindex="-1"]`;
  const modal = document.querySelector(`.${modalName}`);
  return Array.from(modal.querySelectorAll(selector));
}

function toogleFocus(elements) {
  if (elements[0].tabIndex === 0) {
    elements.forEach((element) => {
      element.tabIndex = "-1";
      element.setAttribute("aria-hidden", "true");
    });
  } else {
    elements.forEach((element) => {
      element.tabIndex = "0";
      element.setAttribute("aria-hidden", "false");
    });
  }
}

// Initialisation
async function initialize() {
  await verifySessionStorage();

  // Info Section
  photographerState = getPhotographers(photographerId);
  let infoSectionTemplate = makeInfoHeader(photographerState);
  photographerInfoContainer.insertAdjacentHTML("afterbegin", infoSectionTemplate);
  tags = photographerInfoContainer.querySelectorAll(".btn--tag");

  // Medias
  mediaState = photographerState.medias;
  let tempMediaState;
  let mediaCardsTemplate = makeMediaCard(mediaState);
  mediaCardsTemplate.forEach((card) =>
    mediaContainer.insertAdjacentHTML("beforeend", card)
  );
  galleryImages = mediaContainer.querySelectorAll(".card-photo");
  let lightboxMedias = makeLightboxMedia(mediaState);

  // General Functions ****************************************************************************




  // Gallery's Medias Sorting *********************************************************************

  const sortingForm = document.querySelector(".gallery__sort");
  const sortingButton = document.querySelector(".btn--dropdown");
  const sortingMenu = document.querySelector(".dropdown");
  const sortingMenuOptions = Array.from(sortingMenu.querySelectorAll('[role="option"]'));

  let selectedSort = "popularity";
  let dropdownVisible = false;

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

  function toggleDropdown(e) {
    dropdownVisible = !dropdownVisible;
    sortingMenu.hidden = !sortingMenu.hidden;
    toggleAriaExpanded(sortingButton);
    // sortingMenu.tabIndex = 0;
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
    switch (e.key) {
      case "Tab":
        dropdownVisible = !dropdownVisible;
        sortingMenu.hidden = !sortingMenu.hidden;
        toggleAriaExpanded(sortingButton);
        // sortingMenu.tabIndex = -1;
        galleryImages[0].focus();
        sortingMenu.removeEventListener("keydown", cycleThroughOptions);
        document.removeEventListener("click", outsideClick);
        break;
      case "Escape":
        dropdownVisible = !dropdownVisible;
        sortingMenu.hidden = !sortingMenu.hidden;
        toggleAriaExpanded(sortingButton);
        // sortingMenu.tabIndex = -1;
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
        // sortingMenu.tabIndex = -1;
        sortingButton.focus();
        sortingMenu.removeEventListener("keydown", cycleThroughOptions);
        document.removeEventListener("click", outsideClick);
        break;
      case "Space":
        e.preventDefault();
        sortingButton.firstChild.textContent = selectedSort;
        sortMedia(selectedSort);
        dropdownVisible = !dropdownVisible;
        sortingMenu.hidden = !sortingMenu.hidden;
        toggleAriaExpanded(sortingButton);
        // sortingMenu.tabIndex = -1;
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
          tempMediaState = tempMediaState.sort((a, b) => b.likes - a.likes);
          document.dispatchEvent(new CustomEvent("mediaStateChanged"));
          break;
        }
        tempMediaState = mediaState.sort((a, b) => b.likes - a.likes);
        document.dispatchEvent(new CustomEvent("mediaStateChanged"));
        break;
      case "Date":
        if(tempMediaState) {
          tempMediaState = tempMediaState.sort((a, b) =>
            a.date < b.date ? 1 : b.date < a.date ? -1 : 0
          );
          document.dispatchEvent(new CustomEvent("mediaStateChanged"));
          break;
        }
        tempMediaState = mediaState.sort((a, b) =>
          a.date < b.date ? 1 : b.date < a.date ? -1 : 0
        );
        document.dispatchEvent(new CustomEvent("mediaStateChanged"));
        break;
      case "Titre":
        if (tempMediaState) {
          tempMediaState = tempMediaState.sort((a, b) =>
            a.title > b.title ? 1 : b.title > a.title ? -1 : 0
          );
          document.dispatchEvent(new CustomEvent("mediaStateChanged"));
          break;
        }
        tempMediaState = mediaState.sort((a, b) =>
          a.title > b.title ? 1 : b.title > a.title ? -1 : 0
        );
        document.dispatchEvent(new CustomEvent("mediaStateChanged"));
        break;
      default:
        console.log("Aucune option de triage trouvée.");
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
    // sortingMenu.tabIndex = -1;

  }

  sortingButton.addEventListener("click", toggleDropdown);

  sortingMenuOptions.forEach((option) => {
    option.addEventListener("click", handleClickOptions);
  });

  // Gallery's Medias Filtering *******************************************************************

  let filteredBy;

  function updateMediaState() {
    mediaContainer.innerHTML = "";
    mediaCardsTemplate = makeMediaCard(tempMediaState);
    mediaCardsTemplate.forEach((card) =>
      mediaContainer.insertAdjacentHTML("beforeend", card)
    );
    galleryImages = mediaContainer.querySelectorAll(".card-photo");
    galleryImages.forEach((img) => {
      img.addEventListener("click", handleGalleryCardClicks);
    });
    lightboxMedias = makeLightboxMedia(tempMediaState);
  }

  function filterMedias(e) {
    const tagValue = e.target.dataset.value;
    tags.forEach(tag => tag.setAttribute('aria-selected', 'false'));
    if (!filteredBy || filteredBy !== tagValue) {
      e.currentTarget.setAttribute('aria-selected', 'true');
      filteredBy = tagValue;
      tempMediaState = mediaState.filter((media) => media.tags.includes(tagValue));
      document.dispatchEvent(new CustomEvent("mediaStateChanged"));
    } else {
      e.currentTarget.setAttribute('aria-selected', 'false');
      filteredBy = undefined;
      tempMediaState = mediaState;
      document.dispatchEvent(new CustomEvent("mediaStateChanged"));
    }
  }

  tags.forEach((tag) => tag.addEventListener("click", filterMedias));
  document.addEventListener("mediaStateChanged", updateMediaState);

  // Gallery Cards Behaviour (openLightBox || incrementLike) **************************************

  const lightboxModal = document.querySelector(".modal-lightbox");
  const lightboxMediaContainer = lightboxModal.querySelector(".item");
  const closeButtonLightbox = lightboxModal.querySelector(".carousel__controls__close");
  const prevButtonLightbox = lightboxModal.querySelector(".carousel__controls__prev");
  const nextButtonLightbox = lightboxModal.querySelector(".carousel__controls__next");

  function selectMedia(id) {
    const index = lightboxMedias.findIndex((media) => media.id === id);
    lightboxMedias[index].currentMedia = true;
    lightboxMedias[index + 1]
      ? (lightboxMedias[index + 1].nextMedia = true)
      : (lightboxMedias[0].nextMedia = true);
    lightboxMedias[index - 1]
      ? (lightboxMedias[index - 1].prevMedia = true)
      : (lightboxMedias[lightboxMedias.length - 1].prevMedia = true);
    return lightboxMedias[index].template;
  }

  function resetMedias() {
    lightboxMedias.forEach((media) => {
      media.currentMedia = false;
      media.prevMedia = false;
      media.nextMedia = false;
    });
  }

  function nextMedia() {
    const id = lightboxMedias.find((media) => media.nextMedia).id;
    resetMedias();
    lightboxMediaContainer.innerHTML = selectMedia(id);
  }

  function prevMedia() {
    const id = lightboxMedias.find((media) => media.prevMedia).id;
    resetMedias();
    lightboxMediaContainer.innerHTML = selectMedia(id);
  }

  function handleGalleryCardClicks(e) {
    e.preventDefault();
    if (e.target.dataset.behaviour === "openLightbox") {
      // Obtenir l'image et son titre pour la lightbox
      const mediaId = parseInt(e.currentTarget.dataset.id);
      lightboxMediaContainer.innerHTML = selectMedia(mediaId);
      lightboxModal.classList.add("open");
    }
    if (e.target.dataset.behaviour === "incrementLike") {
      const mediaId = parseInt(e.currentTarget.dataset.id);
      const media = mediaState.find((media) => media.id === mediaId);
      media.likes++;
      tempMediaState = mediaState;
      document.dispatchEvent(new CustomEvent("mediaStateChanged"));
    }
  }

  function closeLightbox() {
    resetMedias();
    lightboxModal.classList.remove("open");
  }

  galleryImages.forEach((img) => {
    img.addEventListener("click", handleGalleryCardClicks);
  });

  closeButtonLightbox.addEventListener("click", closeLightbox);
  nextButtonLightbox.addEventListener("click", nextMedia);
  prevButtonLightbox.addEventListener("click", prevMedia);

  // Contact Modal ********************************************************************************

  const contactModal = document.querySelector(".modal-contact");
  const contactPhotographerName = contactModal.querySelector(".modal-contact__form__title");
  const contactOpenButton = Array.from(document.querySelectorAll(".btn--cta"));
  const contactSubmitButton = contactModal.querySelector(".btn--submit");
  const contactCloseButton = contactModal.querySelector(".btn--close");

  let currentContactOpenButton;

  contactPhotographerName.insertAdjacentHTML("beforeend", photographerState.name);

  function openModal(e) {
    currentContactOpenButton = e.target;
    contactModal.classList.add("open");
    contactModal.focus();
    contactModal.addEventListener('keydown', handleEscapeModal);
  }

  function closeModal() {
    contactModal.classList.remove("open");
    currentContactOpenButton.focus();
    contactModal.removeEventListener('keydown', handleEscapeModal);
  }

  function handleEscapeModal(e) {
    return e.key === "Escape" && closeModal();
  }

  contactOpenButton.forEach((button) => {
    button.addEventListener("click", openModal);
  });

  contactCloseButton.addEventListener("click", closeModal);
  contactCloseButton.addEventListener("keyup", (e) => {
    e.stopPropagation();
    return e.key === "Enter" && closeModal();
  });

  contactModal.addEventListener("click", (e) => {
    e.preventDefault();
    const isOutside = !e.target.closest(".modal__form");
    return isOutside && closeModal();
  });

}

initialize();
