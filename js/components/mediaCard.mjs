export function makeMediaCard(medias) {
  return medias.map(({ id, photographerId, title, image, tags, likes, date, video, desc }) => {
    if (video) {
      //TODO: Video mapping
    } else {
      return `<div class="card card-photo" data-tag="" data-id="" data-photographerId="" data-title="" data-date="">
            <a class="card-photo__img-wrapper" href="#">
              <img alt="" src="../img/Mimi/thumbnail-Animals_Rainbow.webp" />
            </a>
            <p class="card-photo__txt" tabindex="0">
              Arc-en-ciel
              <span class="card-photo__like" tabindex="0">
                12
                <img alt="" src="../img/icons/like-primary.svg" />
              </span>
            </p>
          </div>`;
    }
  });
}
