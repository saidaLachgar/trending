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
    "items(added_at,track(album(name,href,release_date,images,external_urls),artists,duration_ms,name, preview_url))"
  );
  url.searchParams.append("limit", "20");
  url.searchParams.append("offset", "0");

  return fetchApi(url, token);
};

const renderTopTracks = async (data) => {
  const topTracks = data.items;
  const topTracksList = document.getElementById("topTracks");
  const img = document.getElementById("preview");
  const credits = document.createElement("div");
  credits.innerHTML =
    '<p class="credits">Made by <a href="https://saidalachgar.site/" rel="noopener" target="_blank">Saida Lachgar</a></p>';
  topTracksList.innerHTML = "";

  topTracks.forEach((track, index) => {
    const el = document.createElement("li");

    // link
    let linkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="none" viewBox="0 0 23 23"><path fill="currentColor" d="M3.167 21 20.303 3.898v15.764H22V1H3.337v1.696h15.767L2 19.832 3.167 21Z"/><path fill="currentColor" fill-rule="evenodd" d="m3.165 22.414-2.58-2.583L16.693 3.697H2.336V0h20.663v20.662h-3.697V6.308L3.165 22.414ZM20.303 3.898v15.764H22V1H3.337v1.696h15.767L2 19.832 3.167 21 20.303 3.898Z" clip-rule="evenodd"/></svg>`;
    let link = `<a title="Open on spotify" href="${track.track.album.external_urls.spotify}" class="link" target="_blank">${linkIcon}</a>`;
    // content
    let name = `<h3 class="name"><span>${track.track.name}</span>${link}</h3>`;
    let artist = `<p class="artist">${track.track.artists[0].name}</p>`;
    let number = `<p class="number">${String(index + 1).padStart(2, "0")}</p>`;
    // play
    let playIcon = `<span class="play-icon">Play<svg width="25" height="25" viewBox="0 0 24 24"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg></span>`;
    let playingIcon = `<span class="playing-icon">Playing<svg width="20" height="20" viewBox="0 0 14 14" ><path d="M3.99902 14H5.99902V0H3.99902V14ZM-0.000976562 14H1.99902V4H-0.000976562V14ZM12 7V14H14V7H12ZM8.00002 14H10V10H8.00002V14Z" fill="#000"/></svg></span></span>`;
    let pauseIcon = `<span class="pause-icon">Pause<svg width="25" height="25" viewBox="0 0 24 24"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg></span></span>`;
    let button = `<button type="button" class="button">${playIcon}${playingIcon}${pauseIcon}</button>`;
    // media
    let previewUrl = track.track.preview_url;
    let audio = `<audio loop id="audio" src="${previewUrl}"></audio>`;
    let image = track.track.album.images[1].url;
    // result
    el.innerHTML = `${number}<div class="title">${name}${artist}</div>${
      previewUrl ? button : ""
    }${audio}`;
    button = el.querySelector("button");
    audio = el.querySelector("audio");

    // events
    el.addEventListener("mouseover", function (e) {
      img.setAttribute("src", image);
    });
    el.addEventListener("mousemove", (e) => {
      img.style.top = e.clientY + "px";
      img.style.left = e.clientX + "px";
    });
    el.addEventListener("mouseleave", (e) => {
      img.setAttribute("src", "");
    });
    previewUrl &&
      el.addEventListener("click", () => {
        if (audio.duration > 0 && audio.paused) {
          let currentActive = document.querySelector("button.playing");
          currentActive && currentActive.click();
          audio.play();
          button.classList.add("playing");
        } else {
          audio.pause();
          button.classList.remove("playing");
        }
      });

    // "audioprocess,canplay,canplaythrough,complete,durationchange,emptied,ended,loadeddata,loadedmetadata,pause,play,playing,ratechange,seeked,seeking,stalled,suspend,timeupdate,volumechange,waiting".split(",").forEach(name => {
    //   audio.addEventListener(name, (e) => console.log(e.timeStamp.toFixed(2) + ": " + e.type));
    // });

    topTracksList.appendChild(el);
    topTracksList.appendChild(credits);
  });

  document.getElementById("loader").remove();
  setTimeout(() => {
    document.getElementById("header").style.display = "block";
    document.getElementById("app").style.display = "block";
  }, 100);
};

// const renderTopArtists = async (data) => {
//   const artists = data.items.map((item) => item.track.artists[0].name);
//   const uniqueArtists = [...new Set(artists)];
//   const topArtists = uniqueArtists.slice(0, 4);

//   const topArtistsList = document.getElementById("topArtists");
//   topArtistsList.innerHTML = "";
//   topArtists.forEach((artist) => {
//     const li = document.createElement("li");
//     li.textContent = artist;
//     topArtistsList.appendChild(li);
//   });
// };

const setCurrentDate = () => {
  // Get today's date
  var currentDate = new Date();

  // Extract month, day, and day of the week
  var month = currentDate.toLocaleString("default", { month: "short" });
  var day = currentDate.getDate();
  var dayOfWeek = currentDate.toLocaleString("default", { weekday: "short" });

  // Format the date
  var formattedDate = month + " " + day + "<sup>" + dayOfWeek + "</sup>";

  document.getElementById("currentDate").innerHTML = formattedDate;
};
window.onload = async () => {
  setCurrentDate();
  const data = await getData();
  renderTopTracks(data);
  // renderTopArtists(data);
};
