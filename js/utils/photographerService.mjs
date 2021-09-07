const endpoint = "../../public/data/data.json";

async function getData() {
  const response = await fetch(endpoint);
  const data = await response.json();
  sessionStorage.setItem("photographers", JSON.stringify(organizeData(data)));
}

export function getPhotographers(id) {
  const photographers = sessionStorage.getItem("photographers");
  const result = JSON.parse(photographers);
  if (id) {
    return result.find((photographer) => photographer.id === id);
  }
  return result;
}

export function updatePhotographers() {

}

export async function verifySessionStorage() {
  if (!getPhotographers()) {
    await getData();
  }
}

export function wait(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function organizeData(data) {
  const usersInfo = data.photographers;
  const usersMedias = data.media;
  const users = [];
  usersInfo.forEach(({ city, country, id, name, portrait, price, tagline, tags }) => {
    const userMedias = usersMedias.filter((media) => media.photographerId === id);
    const userLikes = userMedias.reduce((acc, { likes }) => {
      return acc + likes;
    }, 0);
    const result = {
      name,
      id,
      city,
      country,
      price,
      tagline,
      tags,
      portrait,
      medias: userMedias,
      likes: userLikes,
      sortMedias() {},
      filterMedias() {},
    };
    users.push(result);
  });
  return users;
}