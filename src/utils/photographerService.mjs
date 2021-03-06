const endpoint = 'https://raw.githubusercontent.com/AEMuto/AntoineMarseaud_6_10082021/main/public/data/data.json';

function organizeData(data) {
  const usersInfo = data.photographers;
  const usersMedias = data.media;
  // Rajouter la propriété liked aux medias,
  // permet de savoir si un média a été 'liké'
  usersMedias.forEach((media) => {
    media.liked = false;
    media.lastFocused = false;
  });
  const users = [];
  usersInfo.forEach(({
    city, country, id, name, portrait, price, tagline, tags,
  }) => {
    const userMedias = usersMedias
      .filter((media) => media.photographerId === id)
      .sort((a, b) => b.likes - a.likes);
    const userLikes = userMedias.reduce((acc, { likes }) => acc + likes, 0);
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
    };
    users.push(result);
  });
  return users;
}

async function getData() {
  const response = await fetch(endpoint);
  const data = await response.json();
  sessionStorage.setItem('photographers', JSON.stringify(organizeData(data)));
}

export function getPhotographers(id) {
  const photographers = sessionStorage.getItem('photographers');
  const result = JSON.parse(photographers);
  if (id) {
    return result.find((photographer) => photographer.id === id);
  }
  return result;
}

export async function verifySessionStorage() {
  if (!getPhotographers()) {
    await getData();
  }
}

export function wait(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
