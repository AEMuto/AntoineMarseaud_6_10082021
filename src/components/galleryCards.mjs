export function Photography({
  id, photographerId, title, image, tags, lastFocused, liked, likes, date, desc,
}) {
  this.id = id;
  this.photographerId = photographerId;
  this.title = title;
  this.tags = tags;
  this.lastFocused = lastFocused;
  this.liked = liked;
  this.likes = likes;
  this.date = date;
  this.desc = desc;
  this.imageSlug = image.split('.')[0];
  this.imagePath = `../medias/${this.photographerId}/${this.imageSlug}.webp`;
  this.thumbnailPath = `../medias/${this.photographerId}/thumbnail-${this.imageSlug}.webp`;
  this.getTemplate = () => `
    <div class="card card-photo"
         data-liked="${this.liked}"
         data-desc="${this.desc}"
         data-path=${this.imagePath}
         data-tag="${this.tags[0]}"
         data-id="${this.id}"
         data-photographerId="${this.photographerId}"
         data-title="${this.title}"
         data-date="${this.date}">
      <a class="card-photo__img-wrapper" href="#" data-behaviour="openLightbox">
        <img alt="${this.desc}" src=${this.thumbnailPath} data-behaviour="openLightbox" />
      </a>
      <p class="card-photo__txt" tabindex="0">
        ${this.title}
        <span class="card-photo__like">
          ${this.likes}
          <button class="btn btn--like"
                  aria-label="Aimer cette photographie"
                  data-behaviour="incrementLike"
                  data-lastFocused="${this.lastFocused}">
            <img alt="likes"
                 src=${this.liked ? '../medias/icons/like-primary.svg' : '../medias/icons/like-primary-stroke.svg'}
                 data-behaviour="incrementLike"/>
          </button>
        </span>
      </p>
    </div>`;
}

export function Video({
  id, photographerId, title, video, tags, lastFocused, liked, likes, date, desc,
}) {
  this.id = id;
  this.photographerId = photographerId;
  this.title = title;
  this.tags = tags;
  this.lastFocused = lastFocused;
  this.liked = liked;
  this.likes = likes;
  this.date = date;
  this.desc = desc;
  this.videoSlug = video.split('.')[0];
  this.videoPath = `../medias/${this.photographerId}/${this.videoSlug}.webp`;
  this.thumbnailPath = `../medias/${this.photographerId}/thumbnail-${this.videoSlug}.webp`;
  this.getTemplate = () => `
    <div class="card card-photo"
         data-liked="${this.liked}"
         data-desc="${this.desc}"
         data-path=${this.videoPath}
         data-tag="${this.tags[0]}"
         data-id="${this.id}"
         data-photographerId="${this.photographerId}"
         data-title="${this.title}"
         data-date="${this.date}">
      <a class="card-photo__img-wrapper" href="#" data-behaviour="openLightbox">
        <img alt="${this.desc}" src=${this.thumbnailPath} data-behaviour="openLightbox" />
      </a>
      <p class="card-photo__txt" tabindex="0">
        ${this.title}
        <span class="card-photo__like">
          ${this.likes}
          <button class="btn btn--like"
                  aria-label="Aimer cette vidéo"
                  data-behaviour="incrementLike"
                  data-lastFocused="${this.lastFocused}">
            <img alt="likes"
                 src=${this.liked ? '../medias/icons/like-primary.svg' : '../medias/icons/like-primary-stroke.svg'}
                 data-behaviour="incrementLike"/>
          </button>
        </span>
      </p>
    </div>`;
}

export function PhotographerCard({
  city, country, name, portrait, price, tagline, tags,
}) {
  this.city = city;
  this.country = country;
  this.name = name;
  this.price = price;
  this.tagline = tagline;
  this.tags = tags;
  this.nameSlug = name.toLowerCase().split(' ').join('-');
  this.portraitSlug = portrait.split('.')[0];
  this.getTemplate = () => `
    <div class="card card-photographer" data-tags="${this.tags.map((tag) => tag).join(' ')}">
      <a
        class="card-photographer__heading"
        href="public/pages/${this.nameSlug}.html"
        aria-label="${this.name} Page">
        <img
          class="card-photographer__avatar"
          src="public/medias/photographers_avatars/md-avatar-${this.portraitSlug}.webp"
          alt=""/>
        <h2 class="card-photographer__name">${this.name}</h2>
      </a>
      <ul aria-label="${this.name} Informations." class="card-photographer__info" tabindex="0">
        <li class="card-photographer__info__location">
          ${this.city}, ${this.country}
          <span class="sr-only">.</span>
        </li>
        <li class="card-photographer__info__motto">
          ${this.tagline}
          <span class="sr-only">.</span>
        </li>
        <li class="card-photographer__info__rate">
          ${this.price}€
          <span class="sr-only">par</span>
          <span aria-hidden="true">/</span>
          jour
          <span class="sr-only">.</span>
        </li>
      </ul>
      <nav class="card-photographer__tags" aria-label="${this.name} Tags">
        ${this.tags.map((tag) => `
            <button class="btn btn--tag" aria-label="${tag} tag" data-value="${tag}">
              <span aria-hidden="true">#</span>${tag}
            </button>`).join('')}
      </nav>
    </div>`;
}
