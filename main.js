import "./style.scss";

const clientId = "a06c52829e614cd5999154a472759adf";
const clientSecret = "2295a3251eab45f2b83006e7baf10ea0";
const authUrl = "https://accounts.spotify.com/api/token";
const apiUrl = "https://api.spotify.com";
let accessToken = "";

const getToken = async () => {
  if (accessToken) {
    return accessToken;
  }
  const authResponse = await fetch(authUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${getEncodedCredentials(clientId, clientSecret)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!authResponse.ok) {
    throw new Error(
      `Failed to get access token: ${authResponse.status} ${authResponse.statusText}`
    );
  }

  const authData = await authResponse.json();
  accessToken = authData.access_token;
  return accessToken;
};

const getEncodedCredentials = (clientId, clientSecret) => {
  if (typeof window !== "undefined" && typeof btoa === "function") {
    return btoa(`${clientId}:${clientSecret}`);
  } else {
    return Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  }
};

const fetchApi = async (url, token, method = "GET", body = null) => {
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : null,
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
};

const getData = async () => {
  // https://developer.spotify.com/documentation/web-api/reference/get-playlist
  const token = await getToken();
  // const playlistId = "37i9dQZEVXbMDoHDwVN2tF"; // top global 50
  const playlistId = "37i9dQZF1DXcBWIGoYBM5M"; // todays top hit
  const endpoint = `v1/playlists/${playlistId}/tracks`;
  var url = new URL(`${apiUrl}/${endpoint}`);
  url.searchParams.append(
    "fields",
    "items(added_at,track(album(name,href,release_date,images),artists,duration_ms,name, preview_url))"
  );
  url.searchParams.append("limit", "8");
  url.searchParams.append("offset", "0");

  return fetchApi(url, token);
};

const renderTopTracks = async (data) => {
  const topTracks = data.items.slice(0, 8);
  const topTracksList = document.getElementById("topTracks");
  topTracksList.innerHTML = "";

  topTracks.forEach((track, index) => {
    const li = document.createElement("li");
    let name = `<h3 class="name">${track.track.name}</h3>`;
    let artist =   `<p class="artist">${track.track.artists[0].name}</p>`;
    let number = `<p class="number">${String(index+1).padStart(2, '0')}</p>`;
    let play = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M8 17.175V6.825q0-.425.3-.713t.7-.287q.125 0 .263.037t.262.113l8.15 5.175q.225.15.338.375t.112.475q0 .25-.113.475t-.337.375l-8.15 5.175q-.125.075-.263.113T9 18.175q-.4 0-.7-.288t-.3-.712Z"/></svg>`;
    let button = `<button class="button">Play${play}</button>`;
    li.innerHTML = `${number}<div class="title">${name}${artist}</div>${button}`;
    topTracksList.appendChild(li);
  });
};

const renderTopArtists = async (data) => {
  const artists = data.items.map((item) => item.track.artists[0].name);
  const uniqueArtists = [...new Set(artists)];
  const topArtists = uniqueArtists.slice(0, 4);

  const topArtistsList = document.getElementById("topArtists");
  topArtistsList.innerHTML = "";
  topArtists.forEach((artist) => {
    const li = document.createElement("li");
    li.textContent = artist;
    topArtistsList.appendChild(li);
  });
};

window.onload = async () => {
  const data = await getData();
  renderTopTracks(data);
  renderTopArtists(data);
};
