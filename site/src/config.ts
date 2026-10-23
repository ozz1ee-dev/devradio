/**
 * Station and site settings. Stream and now-playing URLs live only here.
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
  nowPlayingUrl: "https://stream.radiohost.cloud/api/nowplaying/devradio.co.uk",
} as const;

export const site = {
  name: "DevRadio",
  url: "https://devradio.co.uk",
  title: "DevRadio — lo-fi beats and AI developer news",
  description:
    "A 24/7 community-curated lo-fi station with short English bulletins on AI and software. The voices are AI-generated and disclosed on air.",
  seoDescription:
    "A 24/7 lo-fi internet radio station. Short English conversations cover AI and developer news, hosted by Kai and Mira. Their voices are AI-generated. Alpha.",
  repoUrl: "https://github.com/ozz1ee-dev/devradio",
  language: "en",
  locale: "en_GB",
  themeColor: "#1a1b26",
  logoPath: "/apple-touch-icon.png",
  ogImage: {
    path: "/og/devradio-og.png",
    width: 1200,
    height: 630,
    alt: "DevRadio. Lo-fi beats. AI news, slowed down.",
    type: "image/png",
  },
} as const;

export const docs = {
  contributing: `${site.repoUrl}/blob/main/CONTRIBUTING.md`,
  licenses: `${site.repoUrl}/blob/main/LICENSES.md`,
  takedown: `${site.repoUrl}/blob/main/TAKEDOWN.md`,
} as const;
