export function PhotographerInfoHeader({ city, country, name, portrait, price, tagline, tags, likes, selectedTag, lastSelectedTag }) {
  this.city = city;
  this.country = country;
  this.name = name;
  this.price = price;
  this.tagline = tagline;
  this.tags = tags;
  this.likes = likes;
  this.selectedTag = selectedTag;
  this.lastSelectedTag = lastSelectedTag;
  this.portraitSlug = portrait.split(".")[0];
  this.getTemplate = () => {
    return `
    <h1 class="info__name" tabindex="0">${this.name}</h1>
    <div tabindex="0">
      <p class="info__location">
        ${this.city}, ${this.country}
        <span class="sr-only">.</span>
      </p>
      <p class="info__motto">
        ${this.tagline}
        <span class="sr-only">.</span>
      </p>
    </div>
    <nav aria-label="Photography categories tags" class="info__tags">
      ${this.tags.map(tag => {
          return `
          <button aria-label="Filter by ${tag} tag"
                  class="btn btn--tag"
                  data-value="${tag}"
                  data-lastSelected="${(this.lastSelectedTag === tag)}"
                  aria-selected="${(this.selectedTag === tag)}">
            <span aria-hidden="true">#</span>${tag}
          </button>`;}).join("")}
    </nav>
    <button class="btn btn--cta btn--mobile">Contactez-moi</button>
    <button class="btn btn--cta btn--desktop">Contactez-moi</button>
    <img
      alt="${this.name}"
      class="info__avatar"
      src="../medias/photographers_avatars/md-avatar-${this.portraitSlug}.webp"
      tabindex="0"/>
    <aside class="info__aside" tabindex="0">
      <div class="info__aside__wrapper">
        <span>
          ${this.likes}
          <span class="sr-only">likes<span aria-hidden="true">.</span></span>
          <img alt="" class="info__aside__like" src="../medias/icons/like-black.svg" aria-hidden="true"/>
        </span>
        <span class="info__aside__rate">
          ${this.price}€
          <span class="sr-only">par</span>
          <span aria-hidden="true">/</span>
          jour
          <span class="sr-only">.</span>
        </span>
      </div>
    </aside>`;
  }
}