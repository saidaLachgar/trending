import "./style.scss";

// Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization
const token =
  "BQDvhc35sDMAX28m7pheRLNx40znG0tKJ7Lpg9v0DjX_AK8MvKOtzTGgmHmXONatkQMPh2LkvQLOumeeYz7vQ_kXFIQ8J-oVNppyezMMY53Ubu2MbpcfwVi7BlIX8cym9OtIh5STkZCoMqb45YC7h0BUt2INIuHp4N1tyEuyeWiSKj8aLQtDCpXaiJ6LmuNRTQAWc5CpQQMk47Qnuts42FKC7qpq0LEcwGgh0DuZOccKrB2EpskgkbHCzUzR8PRo2jgQc0vmcCE5jZSf8dGJ";
async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body: JSON.stringify(body),
  });
  return await res.json();
}

async function getTopTracks() {
  // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
  return (await fetchWebApi("v1/playlists/3cEYpjA9oz9GiPac4AsH4n", "GET"))
    .items;
}

const topTracks = await getTopTracks();
console.log(topTracks);
