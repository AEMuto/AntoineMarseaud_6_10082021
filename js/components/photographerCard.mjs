export function makePhotographerCards(photographers) {
	return photographers.map(({ city, country, name, portrait, price, tagline, tags }) => {
		let nameSlug = name.toLowerCase().split(" ").join("-");
		let portraitSlug = portrait.split(".")[0];
		return `<div class="card card-photographer" data-tags="${tags.map(tag => tag).join(' ')}">
        <a
          class="card-photographer__heading"
          href="public/pages/${nameSlug}.html"
          aria-label="${name} Page"
        >
          <img
            class="card-photographer__avatar"
            src="public/medias/photographers_avatars/md-avatar-${portraitSlug}.webp"
            alt=""
          />
          <h2 class="card-photographer__name">${name}</h2>
        </a>
        <ul aria-label="${name} Informations." class="card-photographer__info" tabindex="0">
          <li class="card-photographer__info__location">
            ${city}, ${country}
            <span class="sr-only">.</span>
          </li>
          <li class="card-photographer__info__motto">
            ${tagline}
            <span class="sr-only">.</span>
          </li>
          <li class="card-photographer__info__rate">
            ${price}€
            <span class="sr-only">par</span>
            <span aria-hidden="true">/</span>
            jour
            <span class="sr-only">.</span>
          </li>
        </ul>
        <nav class="card-photographer__tags" aria-label="${name} Tags">
          ${tags
			.map((tag) => {
				return `<button class="btn btn--tag" aria-label="${tag} tag" data-value="${tag}">
            <span aria-hidden="true">#</span>${tag}
          </button>`;
			})
			.join("")}   
        </nav>
      </div>`;
	});
}