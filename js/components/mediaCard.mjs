export function makeMediaCard(medias) {
  return medias.map(({ id, photographerId, title, image, tags, likes, date, video, desc }) => {
    if (video) {
      //TODO: Video mapping
      return null;
    } else {
      let imagePath = image.split('.')[0];
      return `<div class="card card-photo" data-tag="${tags[0]}" data-id="${id}" data-photographerId="${photographerId}" data-title="${title}" data-date="${date}">
            <a class="card-photo__img-wrapper" href="#">
              <img alt="${desc}" src="../img/${photographerId}/thumbnail-${imagePath}.webp" />
            </a>
            <p class="card-photo__txt" tabindex="0">
              ${title}
              <span class="card-photo__like" tabindex="0">
                ${likes}
                <img alt="" src="../img/icons/like-primary.svg" />
              </span>
            </p>
          </div>`;
    }
  });
}
