import { PhotographerCard, Photography, Video } from './galleryCards.mjs';
import { PhotographyLightbox, VideoLightbox } from './lightboxMedias.mjs';
import PhotographerInfoHeader from './photographerInfoHeader.mjs';

function DomFactory() {}

DomFactory.prototype.InstanceType = Photography;

DomFactory.prototype.createInstance = function (options, type) {
  if (!type) {
    console.log("Entrer le type de l'instance : card || lightbox || infoHeader");
  }
  if (type === 'card') {
    if (options.image) {
      this.InstanceType = Photography;
    }
    if (options.video) {
      this.InstanceType = Video;
    }
    if (options.city) {
      this.InstanceType = PhotographerCard;
    }
  }
  if (type === 'lightbox') {
    if (options.image) {
      this.InstanceType = PhotographyLightbox;
    }
    if (options.video) {
      this.InstanceType = VideoLightbox;
    }
  }
  if (type === 'infoHeader') {
    this.InstanceType = PhotographerInfoHeader;
  }
  return new this.InstanceType(options);
};

const templateFactory = new DomFactory();

export { templateFactory as default };
