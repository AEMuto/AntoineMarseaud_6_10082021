export function makeMediaCard(medias) {
  return medias.map(
    ({ id, photographerId, title, image, tags, likes, date, video, desc }) => {
      if (video) {
        const videoSlug = video.split(".")[0];
        const videoPath = `../medias/${photographerId}/${videoSlug}.mp4`;
        const thumbnailPath = `../medias/${photographerId}/thumbnail-${videoSlug}.webp`;
        return `<div class="card card-photo" data-desc="${desc}" data-path=${videoPath} data-tag="${tags[0]}" data-id="${id}" data-photographerId="${photographerId}" data-title="${title}" data-date="${date}" data-video="yes" ">
            <a class="card-photo__img-wrapper" href="#">
              <img alt="${desc}" src=${thumbnailPath} />
            </a>
            <p class="card-photo__txt" tabindex="0">
              ${title}
              <span class="card-photo__like" tabindex="0">
                ${likes}
                <img alt="" src="../medias/icons/like-primary.svg" />
              </span>
            </p>
          </div>`;
      } else {
        const imageSlug = image.split(".")[0];
        const imagePath = `../medias/${photographerId}/${imageSlug}.webp`;
        const thumbnailPath = `../medias/${photographerId}/thumbnail-${imageSlug}.webp`;
        return `<div class="card card-photo" data-desc="${desc}" data-path=${imagePath}  data-tag="${tags[0]}" data-id="${id}" data-photographerId="${photographerId}" data-title="${title}" data-date="${date}" ">
            <a class="card-photo__img-wrapper" href="#">
              <img alt="${desc}" src=${thumbnailPath} />
            </a>
            <p class="card-photo__txt" tabindex="0">
              ${title}
              <span class="card-photo__like" tabindex="0">
                ${likes}
                <img alt="" src="../medias/icons/like-primary.svg" />
              </span>
            </p>
          </div>`;
      }
    }
  );
}

export function makeLightboxMedia(medias) {
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
