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

const modalTitleContainer = document.querySelector(".modal__form__title");
let currentContactButton;
let contactButton;
let closeButton;
let modalForm;
// nonModalNodes nous permet de récupérer les éléments "tabulable".
// Il y a les boutons, les liens, les inputs et les éléments avec l'attribut tabindex="0".
// Lorsqu'une modale apparait tous ces éléments en dehors de la modale ne devrait plus
// être "tabulable" par l'utilisateur.
let nonModalNodes;
let submitButton;

const lightbox = document.querySelector(".lightbox");
const lightboxMediaContainer = lightbox.querySelector(".item");
const closeButtonLightbox = lightbox.querySelector(".carousel__controls__close");
const prevButtonLightbox = lightbox.querySelector(".carousel__controls__prev");
const nextButtonLightbox = lightbox.querySelector(".carousel__controls__next");

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
  const infoSectionTemplate = makeInfoHeader(photographerState);
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

  // Sorting **************************************************************************************
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
    toggleAriaExpanded(sortingMenu);
    sortingMenu.tabIndex = 0;
    sortingMenu.focus();
    setTimeout(() => {
      document.addEventListener("click", outsideClick);
    }, 10);
    setTimeout(() => {
      document.addEventListener("keydown", cycleThroughOptions);
    }, 10);
  }

  function cycleThroughOptions(e) {
    let index;
    switch (e.key) {
      case "Tab":
        dropdownVisible = !dropdownVisible;
        sortingMenu.hidden = !sortingMenu.hidden;
        toggleAriaExpanded(sortingMenu);
        sortingMenu.tabIndex = -1;
        galleryImages[0].focus();
        document.removeEventListener("keydown", cycleThroughOptions);
        document.removeEventListener("click", outsideClick);
        break;
      case "Escape":
        dropdownVisible = !dropdownVisible;
        sortingMenu.hidden = !sortingMenu.hidden;
        toggleAriaExpanded(sortingMenu);
        sortingMenu.tabIndex = -1;
        sortingButton.focus();
        document.removeEventListener("keydown", cycleThroughOptions);
        document.removeEventListener("click", outsideClick);
        break;
      case "Enter":
        e.preventDefault();
        sortingButton.firstChild.textContent = selectedSort;
        sortMedia(selectedSort);
        dropdownVisible = !dropdownVisible;
        sortingMenu.hidden = !sortingMenu.hidden;
        toggleAriaExpanded(sortingMenu);
        sortingMenu.tabIndex = -1;
        sortingButton.focus();
        document.removeEventListener("keydown", cycleThroughOptions);
        document.removeEventListener("click", outsideClick);
        break;
      case "ArrowDown":
        e.preventDefault();
        index = sortingMenuOptions.findIndex(option => option.getAttribute('aria-selected') === 'true');
        toggleAriaSelected(sortingMenuOptions[index]);
        index++;
        if (index > sortingMenuOptions.length - 1) { index = 0 }
        toggleAriaSelected(sortingMenuOptions[index]);
        selectedSort = sortingMenuOptions[index].id;
        console.log(selectedSort);
        break;
      case "ArrowUp":
        e.preventDefault();
        index = sortingMenuOptions.findIndex(option => option.getAttribute('aria-selected') === 'true');
        toggleAriaSelected(sortingMenuOptions[index]);
        index--;
        if (index < 0) { index = sortingMenuOptions.length - 1 }
        toggleAriaSelected(sortingMenuOptions[index]);
        selectedSort = sortingMenuOptions[index].id;
        console.log(selectedSort);
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
      toggleAriaExpanded(sortingMenu);
      sortingMenu.tabIndex = -1;
      document.removeEventListener("click", outsideClick);
      document.removeEventListener("keydown", cycleThroughOptions);
    }
    document.removeEventListener("click", outsideClick);
    document.removeEventListener("keydown", cycleThroughOptions);
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
  // TODO: Appliquer aria-selected à l'option cliqué
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
    toggleAriaExpanded(sortingMenu);
    sortingMenu.tabIndex = -1;

  }

  sortingButton.addEventListener("click", toggleDropdown);

  sortingMenuOptions.forEach((option) => {
    option.addEventListener("click", handleClickOptions);
  });

  // Filtering ************************************************************************************

  let filteredBy;
  // TODO: Changer le style du tag sélectionné
  function updateMediaState() {
    mediaContainer.innerHTML = "";
    mediaCardsTemplate = makeMediaCard(tempMediaState);
    mediaCardsTemplate.forEach((card) =>
      mediaContainer.insertAdjacentHTML("beforeend", card)
    );
    galleryImages = mediaContainer.querySelectorAll(".card-photo");
    galleryImages.forEach((img) => {
      img.addEventListener("click", handleLightboxClick);
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

  // Lightbox & Likes Incrementation **************************************************************

  /**
   * selectMedia(id)
   * Définir l'ordre de visionnage de la lightbox
   * en fonction de l'id du média
   * @param id
   */
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

  /**
   * Event Delegation
   * @param e
   */
  function handleLightboxClick(e) {
    e.preventDefault();
    if (e.target.dataset.behaviour === "openLightbox") {
      // Obtenir l'image et son titre pour la lightbox
      const mediaId = parseInt(e.currentTarget.dataset.id);
      lightboxMediaContainer.innerHTML = selectMedia(mediaId);
      lightbox.classList.add("open");
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
    lightbox.classList.remove("open");
  }

  galleryImages.forEach((img) => {
    img.addEventListener("click", handleLightboxClick);
  });

  closeButtonLightbox.addEventListener("click", closeLightbox);
  nextButtonLightbox.addEventListener("click", nextMedia);
  prevButtonLightbox.addEventListener("click", prevMedia);

  // Modal ****************************************************************************************
  modalTitleContainer.insertAdjacentHTML("beforeend", photographerState.name);

  // Gestion de l'ouverture et de la fermeture de la modale
  // contenant le formulaire de contact.
  // 1. Elements
  contactButton = Array.from(document.querySelectorAll(".btn--cta"));
  closeButton = document.querySelector(".close-btn");
  modalForm = document.querySelector(".modal");
  nonModalNodes = Array.from(
    document.querySelectorAll('header a, main a, main button, main [tabindex="0"]')
  );
  submitButton = document.querySelector(".btn--submit");

  // 2. Fonctions
  function openModal(e) {
    currentContactButton = e.target;
    modalForm.classList.add("open");
    modalForm.focus();
    nonModalNodes.forEach((node) => {
      node.tabIndex = "-1";
      node.setAttribute("aria-hidden", "true");
    });
    window.addEventListener('keydown', handleEscapeModal);
  }

  function closeModal() {
    modalForm.classList.remove("open");
    nonModalNodes.forEach((node) => {
      node.tabIndex = "0";
      node.setAttribute("aria-hidden", "false");
    });
    currentContactButton.focus();
    window.removeEventListener('keydown', handleEscapeModal);
  }

  function handleEscapeModal(e) {
    return e.key === "Escape" && closeModal();
  }

  // 3. Listeners
  contactButton.forEach((button) => {
    button.addEventListener("click", openModal);
  });

  closeButton.addEventListener("click", closeModal);
  closeButton.addEventListener("keyup", (e) => {
    e.stopPropagation();
    return e.key === "Enter" && closeModal();
  });

  modalForm.addEventListener("click", (e) => {
    const isOutside = !e.target.closest(".modal__form");
    return isOutside && closeModal();
  });

  const testNonModalNodes = getOutsideFocusableElements();
  // console.log(testNonModalNodes);
}

initialize();
