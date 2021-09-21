export function makeMediaCard(medias) {
  return medias.map(
    ({ id, photographerId, title, image, tags, likes, date, video, desc }) => {
      if (video) {
        const videoSlug = video.split(".")[0];
        const videoPath = `../medias/${photographerId}/${videoSlug}.mp4`;
        const thumbnailPath = `../medias/${photographerId}/thumbnail-${videoSlug}.webp`;
        return `<div class="card card-photo" data-desc="${desc}" data-path=${videoPath} data-tag="${tags[0]}" data-id="${id}" data-photographerId="${photographerId}" data-title="${title}" data-date="${date}" data-video="yes" ">
            <a class="card-photo__img-wrapper" href="#" data-behaviour="openLightbox">
              <img alt="${desc}" src=${thumbnailPath} data-behaviour="openLightbox" />
            </a>
            <p class="card-photo__txt" tabindex="0">
              ${title}
              <span class="card-photo__like" tabindex="0">
                ${likes}
                <button class="btn btn--like" data-behaviour="incrementLike">
                  <img alt="likes" src="../medias/icons/like-primary.svg" data-behaviour="incrementLike" />
                </button>
              </span>
            </p>
          </div>`;
      } else {
        const imageSlug = image.split(".")[0];
        const imagePath = `../medias/${photographerId}/${imageSlug}.webp`;
        const thumbnailPath = `../medias/${photographerId}/thumbnail-${imageSlug}.webp`;
        return `<div class="card card-photo" data-desc="${desc}" data-path=${imagePath}  data-tag="${tags[0]}" data-id="${id}" data-photographerId="${photographerId}" data-title="${title}" data-date="${date}" ">
            <a class="card-photo__img-wrapper" href="#" data-behaviour="openLightbox">
              <img alt="${desc}" src=${thumbnailPath} data-behaviour="openLightbox" />
            </a>
            <p class="card-photo__txt" tabindex="0">
              ${title}
              <span class="card-photo__like" tabindex="0">
                ${likes}
                <button class="btn btn--like" data-behaviour="incrementLike">
                  <img alt="likes" src="../medias/icons/like-primary.svg" data-behaviour="incrementLike"/>
                </button>
              </span>
            </p>
          </div>`;
      }
    }
  );
}

export function makeMediaLightbox(medias) {
  return medias.map(({ id, photographerId, title, image, video, desc }) => {
    if (video) {
      const videoSlug = video.split(".")[0];
      return {
        id: id,
        currentMedia: false,
        prevMedia: false,
        nextMedia: false,
        template: `<div class="item__wrapper">
									   <video controls>
									   	<source src="../medias/${photographerId}/${videoSlug}.mp4" type="video/mp4">
									   </video>
                   </div>
                   <figcaption class="item__title" tabindex="-1">${title}</figcaption>`,
      };
    } else {
      const imageSlug = image.split(".")[0];
      return {
        id: id,
        currentMedia: false,
        prevMedia: false,
        nextMedia: false,
        template: `<div class="item__wrapper">
                     <img src="../medias/${photographerId}/${imageSlug}.webp" alt="${desc}" tabindex="-1" />
                   </div>
                   <figcaption class="item__title" tabindex="-1">${title}</figcaption>`,
      };
    }
  });
}


function Photography({ id, photographerId, title, image, tags, liked, likes, date, desc }) {
  this.id = id;
  this.photographerId = photographerId;
  this.title = title;
  this.tags = tags;
  this.liked = liked;
  this.likes = likes;
  this.date = date;
  this.desc = desc;
  this.imageSlug = image.split(".")[0];
  this.imagePath = `../medias/${this.photographerId}/${this.imageSlug}.webp`;
  this.thumbnailPath = `../medias/${this.photographerId}/thumbnail-${this.imageSlug}.webp`;
  this.getTemplate = () => {
    if (this.liked) {
      return `<div class="card card-photo" data-liked="${this.liked}" data-desc="${this.desc}" data-path=${this.imagePath} data-tag="${this.tags[0]}" data-id="${this.id}" data-photographerId="${this.photographerId}" data-title="${this.title}" data-date="${this.date}">
                <a class="card-photo__img-wrapper" href="#" data-behaviour="openLightbox">
                  <img alt="${this.desc}" src=${this.thumbnailPath} data-behaviour="openLightbox" />
                </a>
                <p class="card-photo__txt" tabindex="0">
                  ${this.title}
                  <span class="card-photo__like" tabindex="0">
                    ${this.likes}
                    <button class="btn btn--like" data-behaviour="incrementLike">
                      <img alt="likes" src="../medias/icons/like-primary.svg" data-behaviour="incrementLike"/>
                    </button>
                  </span>
                </p>
              </div>`;
    } else {
      return `<div class="card card-photo" data-liked="${this.liked}" data-desc="${this.desc}" data-path=${this.imagePath} data-tag="${this.tags[0]}" data-id="${this.id}" data-photographerId="${this.photographerId}" data-title="${this.title}" data-date="${this.date}">
                <a class="card-photo__img-wrapper" href="#" data-behaviour="openLightbox">
                  <img alt="${this.desc}" src=${this.thumbnailPath} data-behaviour="openLightbox" />
                </a>
                <p class="card-photo__txt" tabindex="0">
                  ${this.title}
                  <span class="card-photo__like" tabindex="0">
                    ${this.likes}
                    <button class="btn btn--like" data-behaviour="incrementLike">
                      <img alt="likes" src="../medias/icons/like-primary-stroke.svg" data-behaviour="incrementLike"/>
                    </button>
                  </span>
                </p>
              </div>`;
    }
  }
}

function PhotographyLightbox({ id, photographerId, title, image, desc }) {
  this.id = id;
  this.photographerId = photographerId;
  this.title = title;
  this.desc = desc;
  this.imageSlug = image.split(".")[0];
  this.currentMedia = false;
  this.prevMedia = false;
  this.nextMedia = false;
  this.getTemplate = () => {
    return `<div class="item__wrapper">
              <img src="../medias/${this.photographerId}/${this.imageSlug}.webp" alt="${this.desc}" tabindex="-1" />
            </div>
            <figcaption class="item__title" tabindex="-1">${this.title}</figcaption>`;
  }
}

function Video({ id, photographerId, title, video, tags, liked, likes, date, desc }) {
  this.id = id;
  this.photographerId = photographerId;
  this.title = title;
  this.tags = tags;
  this.liked = liked;
  this.likes = likes;
  this.date = date;
  this.desc = desc;
  this.videoSlug = video.split(".")[0];
  this.videoPath = `../medias/${this.photographerId}/${this.videoSlug}.webp`;
  this.thumbnailPath = `../medias/${this.photographerId}/thumbnail-${this.videoSlug}.webp`;
  this.getTemplate = () => {
    if (this.liked) {
      return `<div class="card card-photo" data-liked="${this.liked}" data-desc="${this.desc}" data-path=${this.videoPath} data-tag="${this.tags[0]}" data-id="${this.id}" data-photographerId="${this.photographerId}" data-title="${this.title}" data-date="${this.date}">
                <a class="card-photo__img-wrapper" href="#" data-behaviour="openLightbox">
                  <img alt="${this.desc}" src=${this.thumbnailPath} data-behaviour="openLightbox" />
                </a>
                <p class="card-photo__txt" tabindex="0">
                  ${this.title}
                  <span class="card-photo__like" tabindex="0">
                    ${this.likes}
                    <button class="btn btn--like" data-behaviour="incrementLike">
                      <img alt="likes" src="../medias/icons/like-primary.svg" data-behaviour="incrementLike"/>
                    </button>
                  </span>
                </p>
              </div>`;
    } else {
      return `<div class="card card-photo" data-liked="${this.liked}" data-desc="${this.desc}" data-path=${this.videoPath} data-tag="${this.tags[0]}" data-id="${this.id}" data-photographerId="${this.photographerId}" data-title="${this.title}" data-date="${this.date}">
                <a class="card-photo__img-wrapper" href="#" data-behaviour="openLightbox">
                  <img alt="${this.desc}" src=${this.thumbnailPath} data-behaviour="openLightbox" />
                </a>
                <p class="card-photo__txt" tabindex="0">
                  ${this.title}
                  <span class="card-photo__like" tabindex="0">
                    ${this.likes}
                    <button class="btn btn--like" data-behaviour="incrementLike">
                      <img alt="likes" src="../medias/icons/like-primary-stroke.svg" data-behaviour="incrementLike"/>
                    </button>
                  </span>
                </p>
              </div>`;
    }
  }
}

function VideoLightbox({ id, photographerId, title, video, desc }) {
  this.id = id;
  this.photographerId = photographerId;
  this.title = title;
  this.desc = desc;
  this.videoSlug = video.split(".")[0];
  this.currentMedia = false;
  this.prevMedia = false;
  this.nextMedia = false;
  this.getTemplate = () => {
    return `<div class="item__wrapper">
              <video controls>
              <source src="../medias/${this.photographerId}/${this.videoSlug}.mp4" type="video/mp4">
              </video>
            </div>
            <figcaption class="item__title" tabindex="-1">${this.title}</figcaption>`;
  }
}

function PhotographerCard({ city, country, name, portrait, price, tagline, tags }) {
  this.city = city;
  this.country = country;
  this.name = name;
  this.price = price;
  this.tagline = tagline;
  this.tags = tags;
  this.nameSlug = name.toLowerCase().split(" ").join("-");
  this.portraitSlug = portrait.split(".")[0];
  this.getTemplate = () => {
    return `<div class="card card-photographer" data-tags="${this.tags.map(tag => tag).join(' ')}">
        <a
          class="card-photographer__heading"
          href="public/pages/${this.nameSlug}.html"
          aria-label="${this.name} Page"
        >
          <img
            class="card-photographer__avatar"
            src="public/medias/photographers_avatars/md-avatar-${this.portraitSlug}.webp"
            alt=""
          />
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
          ${this.tags.map(tag => {
            return `<button class="btn btn--tag" aria-label="${tag} tag" data-value="${tag}">
                      <span aria-hidden="true">#</span>${tag}
                    </button>`;}).join("")}   
        </nav>
      </div>`;
  }
}

function PhotographerInfoHeader({ city, country, name, portrait, price, tagline, tags, likes, selectedTag }) {
  this.city = city;
  this.country = country;
  this.name = name;
  this.price = price;
  this.tagline = tagline;
  this.tags = tags;
  this.likes = likes;
  this.selectedTag = selectedTag;
  this.portraitSlug = portrait.split(".")[0];
  this.getTemplate = () => {
    return `<h1 class="info__name" tabindex="0">${this.name}</h1>
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
            return `<button aria-label="Filter by ${tag} tag" class="btn btn--tag" data-value="${tag}" aria-selected="${(this.selectedTag === tag)}">
                      <span aria-hidden="true">#</span>${tag}
                    </button>`;}).join("")}
        </nav>
        <button class="btn btn--cta btn--mobile">Contactez-moi</button>
        <button class="btn btn--cta btn--desktop">Contactez-moi</button>
        <img
          alt="${this.name}"
          class="info__avatar"
          src="../medias/photographers_avatars/md-avatar-${this.portraitSlug}.webp"
          tabindex="0"
        />
        <aside class="info__aside" tabindex="0">
          <div class="info__aside__wrapper">
            <span>
              ${this.likes}
              <span class="sr-only">.</span>
              <img alt="" class="info__aside__like" src="../medias/icons/like-black.svg" />
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

function DomFactory() {}
DomFactory.prototype.instanceType = Photography;
DomFactory.prototype.createInstance = function(options, type) {
  if (!type) { console.log(`Entrer le type de l'instance : card || lightbox || infoHeader`); }
  if (type === 'card') {
    if (options.image) { this.instanceType = Photography; }
    if (options.video) { this.instanceType = Video; }
    if (options.city) { this.instanceType = PhotographerCard; }
  }
  if (type === 'lightbox') {
    if (options.image) { this.instanceType = PhotographyLightbox; }
    if (options.video) { this.instanceType = VideoLightbox; }
  }
  if (type === 'infoHeader') { this.instanceType = PhotographerInfoHeader; }
  return new this.instanceType(options)
}

export const templateFactory = new DomFactory();