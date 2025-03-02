import "./style.scss";

const itunesApiUrl = "https://itunes.apple.com/us/rss/topsongs/limit=20/json";

const getData = async () => {
  try {
    const response = await fetch(itunesApiUrl);
    if (!response.ok) {
      throw new Error(
        `Request failed: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    return data.feed.entry;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

const renderTopTracks = async (topTracks) => {
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
    let link = `<a title="Open on iTunes" href="${track.id.label}" class="link" target="_blank">${linkIcon}</a>`;
    // content
    let name = `<h3 class="name"><span>${track["im:name"]["label"]}</span>${link}</h3>`;
    let artist = `<p class="artist">${track["im:artist"]["label"]}</p>`;
    let number = `<p class="number">${String(index + 1).padStart(2, "0")}</p>`;
    // play
    let playIcon = `<span class="play-icon">Play<svg width="25" height="25" viewBox="0 0 24 24"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg></span>`;
    let playingIcon = `<span class="playing-icon">Playing<svg width="20" height="20" viewBox="0 0 14 14" ><path d="M3.99902 14H5.99902V0H3.99902V14ZM-0.000976562 14H1.99902V4H-0.000976562V14ZM12 7V14H14V7H12ZM8.00002 14H10V10H8.00002V14Z" fill="#000"/></svg></span></span>`;
    let pauseIcon = `<span class="pause-icon">Pause<svg width="25" height="25" viewBox="0 0 24 24"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg></span></span>`;
    let button = `<button type="button" class="button">${playIcon}${playingIcon}${pauseIcon}</button>`;
    // img
    let image = track["im:image"].pop().label;
    // media
    let previewUrl = track.link.find(({ attributes }) =>
      attributes.type.includes("audio")
    );
    let audio = "";
    if (previewUrl) {
      audio = `<audio loop id="audio" src="${previewUrl.attributes.href}"></audio>`;
    }
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

    topTracksList.appendChild(el);
    topTracksList.appendChild(credits);
  });

  document.getElementById("loader").remove();
  setTimeout(() => {
    document.getElementById("header").style.display = "block";
    document.getElementById("app").style.display = "block";
  }, 100);
};

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
};
