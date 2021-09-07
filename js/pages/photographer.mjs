import { getPhotographers, verifySessionStorage } from "../utils/photographerService.mjs";
import { makeInfoHeader } from "../components/photographerInfoHeader.mjs";
import { makeMediaCard } from "../components/mediaCard.mjs";

// Enlever la classe preload sur body après chargement de la page
// pour que les transitions se déroulent normalement
window.onload = () => {
  document.querySelector("body").classList.remove("preload");
};

// Récupérer l'ID du photographe
const photographerId = parseInt(document.querySelector('meta[name="PhotographerId"]').content);

// Containers dans lesquels on injecte les templates
const photographerInfoContainer = document.querySelector("section.info");
const mediaContainer = document.querySelector(".gallery__wrapper");
const modalTitleContainer = document.querySelector('.modal__form__title');
let photographerState;
let mediaState;

let currentContactButton;
let contactButton;
let closeButton;
let modal;
let nonModalNodes;
let submitButton;

// Initialisation
async function initialize() {
  await verifySessionStorage();

  // Info Section
  photographerState = getPhotographers(photographerId);
  const infoSectionTemplate = makeInfoHeader(photographerState);
  photographerInfoContainer.insertAdjacentHTML("afterbegin", infoSectionTemplate);

  // Medias
  mediaState = photographerState.medias
  const mediaCardsTemplate = makeMediaCard(mediaState);
  mediaCardsTemplate.forEach(card => mediaContainer.insertAdjacentHTML('afterbegin', card));

  // Modal Title
  modalTitleContainer.insertAdjacentHTML("beforeend", photographerState.name);

  // Gestion de l'ouverture et de la fermeture de la modale
  // contenant le formulaire de contact.
  // 1. Elements
  contactButton = Array.from(document.querySelectorAll(".btn--cta"));
  closeButton = document.querySelector(".close-btn");
  modal = document.querySelector(".modal");
  nonModalNodes = Array.from(
    document.querySelectorAll('header a, main a, main button, main [tabindex="0"]')
  );
  submitButton = document.querySelector(".btn--submit");

  // 2. Fonctions
  function openModal(e) {
    currentContactButton = e.target;
    modal.classList.add("open");
    modal.focus();
    nonModalNodes.forEach((node) => {
      node.tabIndex = "-1";
      node.setAttribute("aria-hidden", "true");
    });
  }

  function closeModal() {
    modal.classList.remove("open");
    nonModalNodes.forEach((node) => {
      node.tabIndex = "0";
      node.setAttribute("aria-hidden", "false");
    });
    currentContactButton.focus();
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

  modal.addEventListener("click", (e) => {
    const isOutside = !e.target.closest(".modal__form");
    return isOutside && closeModal();
  });

  window.addEventListener("keydown", (e) => {
    e.stopPropagation();
    return e.key === "Escape" && closeModal();
  });
}

initialize();

// Gestion du dropdown pour le triage des médias

// Formulaire de triage des médias
const sortingForm = document.querySelector(".gallery__sort");
const sortingButton = document.querySelector(".btn--dropdown");
const sortingMenu = document.querySelector(".dropdown");
const sortingMenuOptions = sortingMenu.querySelectorAll('[role="option"]');
let selectedSort = "popularity";

function toggleDropdown() {
  sortingMenu.hidden = !sortingMenu.hidden;
  document.dispatchEvent(new CustomEvent("dropdownVisibility"));
}

function outsideClick(e) {
  const isOutside = !e.target.closest(".dropdown");
  if (isOutside) {
    sortingMenu.hidden = !sortingMenu.hidden;
  }
}

sortingButton.addEventListener("click", toggleDropdown);

document.addEventListener("dropdownVisibility", (e) => {
  if (!sortingMenu.hidden) {
    setTimeout(() => {
      document.addEventListener("click", outsideClick);
    }, 10);
  }
  document.removeEventListener("click", outsideClick);
});

sortingMenuOptions.forEach((option) => {
  option.addEventListener("click", (e) => {
    sortingButton.firstChild.textContent = e.target.textContent;
    selectedSort = e.target.id;
    console.log("Selected sort is ", selectedSort);
    toggleDropdown();
  });
});
