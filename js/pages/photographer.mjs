const nonModalNodes = Array.from(document.querySelectorAll('header a, main a, main button, main [tabindex="0"]'));
console.log(nonModalNodes);
const contactButton = Array.from(document.querySelectorAll('.btn--cta'));
let currentContactButton;

const closeButton = document.querySelector('.close-btn');
const submitButton = document.querySelector('.btn--submit');
const modal = document.querySelector('.modal');

const endpoint = '../data/data.json';

async function getData(name) {
    const response = await fetch(endpoint);
    const data = await response.json();
    const photographerData = await data.photographers.find(photographer => photographer.name === name);
    // console.table(data.photographers);
    console.log(photographerData);
}

// Gestion de l'ouverture et de la fermeture de la modale
// contenant le formulaire de contact.

function openModal(e) {
    currentContactButton = e.target;
    modal.classList.add('open');
    modal.focus();
    nonModalNodes.forEach(node => {
        node.tabIndex = "-1";
        node.setAttribute("aria-hidden", "true");
    });
}

function closeModal() {
    modal.classList.remove('open');
    nonModalNodes.forEach(node => {
        node.tabIndex = "0";
        node.setAttribute("aria-hidden", "false");
    });
    currentContactButton.focus();
}

contactButton.forEach(button => {
    button.addEventListener('click', openModal);
});

closeButton.addEventListener('click', closeModal);
closeButton.addEventListener('keyup', e => {
    e.stopPropagation();
    return e.key === 'Enter' && closeModal();
});


modal.addEventListener('click', e => {
    const isOutside = !e.target.closest('.modal__form');
    return isOutside && closeModal();
});

window.addEventListener('keydown', e => {
    e.stopPropagation();
    return e.key === 'Escape' && closeModal();
});
