import {
  verifySessionStorage,
  getPhotographers,
  wait,
} from './utils/photographerService.mjs';
import templateFactory from './components/factory.mjs';

// Enlever la classe preload sur body après chargement de la page
// pour que les transitions se déroulent normalement
window.onload = () => {
  document.querySelector('body').classList.remove('preload');
};

async function initialize() {
  // Vérifier que sessionStorage n'est pas vide.
  // Si c'est le cas la fonction le remplit avec
  // les données dont on a besoin.
  await verifySessionStorage();

  const main = document.querySelector('.main');

  // Chercher les données présentes dans le sessionStorage
  const photographersState = getPhotographers();

  // Remplir un tableau avec pour chaque photographes une instance les représentant.
  const cardsArray = [];
  photographersState.forEach((photographer) => {
    cardsArray.push(templateFactory.createInstance(photographer, 'card'));
  });

  // Injecter chaque template HTML dans le DOM
  cardsArray.forEach((card) => main.insertAdjacentHTML('afterbegin', card.getTemplate()));

  // Variable post-insertion
  const tags = Array.from(document.querySelectorAll('.btn--tag'));

  // Par défaut l'élément .card-photographer à une opacité de 0
  // Pour chacun d'entre eux rajouter la classe .loaded
  const currentCards = document.querySelectorAll('.card-photographer');
  for (const card of currentCards) {
    await wait(50);
    card.classList.add('loaded');
  }

  // Filtrage des Photographes lors du click sur un tag *******************************************

  let filteredBy;

  function displayAllCards() {
    currentCards.forEach((card) => (card.style.display = 'flex'));
  }

  function filterPhotographersCards(e) {
    tags.forEach((tag) => tag.setAttribute('aria-selected', 'false'));
    const tagValue = e.currentTarget.dataset.value;
    const selectedTags = tags.filter((tag) => tag.dataset.value === tagValue);
    displayAllCards();
    if (!filteredBy || filteredBy !== tagValue) {
      selectedTags.forEach((tag) => tag.setAttribute('aria-selected', 'true'));
      filteredBy = tagValue;
      currentCards.forEach((card) => {
        !card.dataset.tags.includes(tagValue) ? (card.style.display = 'none') : '';
      });
    } else {
      selectedTags.forEach((tag) => tag.setAttribute('aria-selected', 'false'));
      filteredBy = undefined;
      displayAllCards();
    }
  }

  tags.forEach((tag) => {
    tag.addEventListener('click', filterPhotographersCards);
  });

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

  scrollToTopButton.addEventListener('click', () => scrollToTopContainer.focus());

  // Fonctionnalité pour le bouton "Passer au contenu" (uniquement visible pour lecteur d'écran)

  const goToContentButton = document.querySelector('.goToContent');

  goToContentButton.addEventListener('click', () => main.focus());
}

initialize();
