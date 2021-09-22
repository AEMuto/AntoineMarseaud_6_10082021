import { PhotographerCard, Photography, Video } from "./galleryCards.mjs";
import { PhotographyLightbox, VideoLightbox } from "./lightboxMedias.mjs";
import { PhotographerInfoHeader } from "./photographerInfoHeader.mjs";

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