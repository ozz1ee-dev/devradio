/**
 * Station and site settings. Stream, player, and now-playing URLs live only here.
 *
 * Station id 7, shortcode `devradio.co.uk`.
 * The stream and now-playing endpoints are the public URLs for that station.
 * Both answer 404 while the station is off air. The page treats a failed
 * mount or a failed now-playing request as "Offline — coming soon".
 */
export const station = {
  stationId: 7,
  shortcode: "devradio.co.uk",
  streamUrl: "https://stream.radiohost.cloud/listen/devradio.co.uk/radio.mp3",
  publicPlayerUrl: "https://stream.radiohost.cloud/public/devradio.co.uk",
  nowPlayingUrl: "https://stream.radiohost.cloud/api/nowplaying/devradio.co.uk",
} as const;

export const site = {
  name: "DevRadio",
  url: "https://devradio.co.uk",
  description:
    "A 24/7 community-curated lo-fi station with short English bulletins on AI and software. The voices are AI-generated and disclosed on air.",
  repoUrl: "https://github.com/ozz1ee-dev/devradio",
  language: "en",
} as const;

export const docs = {
  contributing: `${site.repoUrl}/blob/main/CONTRIBUTING.md`,
  licenses: `${site.repoUrl}/blob/main/LICENSES.md`,
  takedown: `${site.repoUrl}/blob/main/TAKEDOWN.md`,
} as const;
