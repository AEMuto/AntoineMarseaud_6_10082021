export function PhotographyLightbox({ id, photographerId, title, image, desc }) {
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
              <img src="../medias/${this.photographerId}/${this.imageSlug}.webp" alt="${this.desc}" tabindex="0"/>
            </div>
            <figcaption class="item__title" tabindex="0">${this.title}</figcaption>`;
	}
}

export function VideoLightbox({ id, photographerId, title, video, desc }) {
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
            <figcaption class="item__title" tabindex="0">${this.title}</figcaption>`;
	}
}