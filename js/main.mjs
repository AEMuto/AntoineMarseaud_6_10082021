import {verifySessionStorage, getPhotographers, wait} from "./utils/photographerService.mjs";
import {makePhotographerCards} from "./components/photographerCard.mjs";

// Enlever la classe preload sur body après chargement de la page
// pour que les transitions se déroulent normalement
window.onload = () => {
  document.querySelector("body").classList.remove("preload");
};

const main = document.querySelector(".main");
let tags;

async function initialize() {
  // Vérifier que sessionStorage n'est pas vide.
  // Si c'est le cas la fonction le remplit avec
  // les données dont on a besoin.
  await verifySessionStorage();

  // Chercher les données présentes dans le sessionStorage
  const photographers = getPhotographers();
  console.log(photographers);

  // Remplir un tableau avec pour chaque photographes un template HTML
  // les représentant.
  const cardsArray = makePhotographerCards(photographers);

  // Injecter chaque template HTML dans le DOM
  cardsArray.forEach(card => main.insertAdjacentHTML("afterbegin", card));

  // Par défaut l'élément .card-photographer à une opacité de 0
  // Pour chacun d'entre eux rajouter la classe .loaded
  let currentCards = document.querySelectorAll('.card-photographer');
  for (const card of currentCards) {
    await wait(100);
    card.classList.add('loaded');
    await wait(100);
  }

  // Filtrage des Photographes lors du click sur un tag
  function filterPhotographersCards(e) {
    console.log('FILTERED! AHAH!');
    console.log(e.target.dataset.value);
    const tagValue = e.target.dataset.value;
    currentCards.forEach(card => card.style.display = "flex");
    return currentCards.forEach(card => {
      return !card.dataset.tags.includes(tagValue)
        ? card.style.display = "none"
        : '';
    });
  }
  tags = document.querySelectorAll('.btn--tag');
  tags.forEach(tag => {
    tag.addEventListener('click', filterPhotographersCards)
  })
}

initialize();