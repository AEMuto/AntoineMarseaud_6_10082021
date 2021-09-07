export function makeInfoHeader({
  city,
  country,
  name,
  portrait,
  price,
  tagline,
  tags,
  likes,
}) {
  let portraitSlug = portrait.split(".")[0];
  return `<h1 class="info__name" tabindex="0">${name}</h1>
        <div tabindex="0">
          <p class="info__location">
            ${city}, ${country}
            <span class="sr-only">.</span>
          </p>
          <p class="info__motto">
            ${tagline}
            <span class="sr-only">.</span>
          </p>
        </div>
        <nav aria-label="Photography categories tags" class="info__tags">
          ${tags
            .map((tag) => {
              return `<button aria-label="Filter by ${tag} tag" class="btn btn--tag">
            <span aria-hidden="true">#</span>${tag}
          </button>`;
            })
            .join("")}
        </nav>
        <button class="btn btn--cta btn--mobile">Contactez-moi</button>
        <button class="btn btn--cta btn--desktop">Contactez-moi</button>
        <img
          alt="${name}"
          class="info__avatar"
          src="../img/photographers_avatars/md-avatar-${portraitSlug}.webp"
          tabindex="0"
        />
        <aside class="info__aside" tabindex="0">
          <div class="info__aside__wrapper">
            <span>
              ${likes}
              <span class="sr-only">.</span>
              <img alt="" class="info__aside__like" src="../img/icons/like-black.svg" />
            </span>
            <span class="info__aside__rate">
							${price}€
              <span class="sr-only">par</span>
              <span aria-hidden="true">/</span>
              jour
              <span class="sr-only">.</span>
						</span>
          </div>
        </aside>`;
}
