import { pageUrl } from "../lib/tracks";

/**
 * On-air library credits. These are track and artist pages only.
 * Free Music Archive terms forbid linking to hosted audio files, so this
 * catalogue is not a tracks/<slug>/track.yaml submission.
 */

export const licenceDeeds = {
  "CC-BY-3.0": {
    name: "CC BY 3.0",
    url: "https://creativecommons.org/licenses/by/3.0/",
  },
  "CC-BY-4.0": {
    name: "CC BY 4.0",
    url: "https://creativecommons.org/licenses/by/4.0/",
  },
  "CC-BY-SA-4.0": {
    name: "CC BY-SA 4.0",
    url: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  "CC0-1.0": {
    name: "CC0 1.0",
    url: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
} as const;

export type LibraryLicence = "CC-BY-3.0" | "CC-BY-4.0" | "CC0-1.0";

export type CreditArtist = {
  name: string;
  url: string;
  /** Extra line the artist asks to show with each of their tracks. */
  creditLine?: string;
};

export type CreditTrack = {
  title: string;
  artist: CreditArtist;
  /** Free Music Archive track page. */
  trackUrl: string;
  licence: LibraryLicence;
};

export const PURRPLE_CAT_LINE = "Music by Purrple Cat - https://purrplecat.com/";

const catalogueLicences: Record<string, { name: string; url: string | null }> = {
  "CC-BY-4.0": licenceDeeds["CC-BY-4.0"],
  "CC-BY-SA-4.0": licenceDeeds["CC-BY-SA-4.0"],
  "CC0-1.0": licenceDeeds["CC0-1.0"],
  "SUNO-PAID-OWN": { name: "Suno paid plan", url: null },
};

export function licencePresentation(code: string | undefined): { name: string; url: string | null } | null {
  if (!code) return null;
  return catalogueLicences[code] ?? { name: code, url: null };
}

function mustPage(url: string): string {
  const safe = pageUrl(url);
  if (!safe) throw new Error(`Refusing credit URL: ${url}`);
  return safe;
}

function artist(name: string, url: string, creditLine?: string): CreditArtist {
  return { name, url: mustPage(url), creditLine };
}

const holizna = artist("HoliznaCC0", "https://freemusicarchive.org/music/holiznacc0/");
const brokeForFree = artist("Broke For Free", "https://freemusicarchive.org/music/Broke_For_Free/");
const purrpleCat = artist(
  "Purrple Cat",
  "https://freemusicarchive.org/music/purrple-cat/",
  PURRPLE_CAT_LINE,
);
const melatronic = artist("Melatronic", "https://freemusicarchive.org/music/melatronic-1/");

function track(
  title: string,
  creditArtist: CreditArtist,
  trackUrl: string,
  licence: LibraryLicence,
): CreditTrack {
  return { title, artist: creditArtist, trackUrl: mustPage(trackUrl), licence };
}

/** Creative Commons Attribution tracks. Attribution is required. */
export const attributionTracks: CreditTrack[] = [
  track(
    "Night Owl",
    brokeForFree,
    "https://freemusicarchive.org/music/Broke_For_Free/Directionless_EP/Broke_For_Free_-_Directionless_EP_-_01_Night_Owl/",
    "CC-BY-3.0",
  ),
  track(
    "My Always Mood",
    brokeForFree,
    "https://freemusicarchive.org/music/Broke_For_Free/Directionless_EP/Broke_For_Free_-_Directionless_EP_-_02_My_Always_Mood/",
    "CC-BY-3.0",
  ),
  track(
    "Day Bird",
    brokeForFree,
    "https://freemusicarchive.org/music/Broke_For_Free/Directionless_EP/Broke_For_Free_-_Directionless_EP_-_03_Day_Bird/",
    "CC-BY-3.0",
  ),
  track(
    "Mell's Parade",
    brokeForFree,
    "https://freemusicarchive.org/music/Broke_For_Free/Directionless_EP/Broke_For_Free_-_Directionless_EP_-_05_Mells_Parade/",
    "CC-BY-3.0",
  ),
  track(
    "Only Instrumental",
    brokeForFree,
    "https://freemusicarchive.org/music/Broke_For_Free/Directionless_EP/Broke_For_Free_-_Directionless_EP_-_06_Only_Instrumental/",
    "CC-BY-3.0",
  ),
  track(
    "Bookworm",
    purrpleCat,
    "https://freemusicarchive.org/music/purrple-cat/a-good-book/bookworm/",
    "CC-BY-4.0",
  ),
  track(
    "Coffee Jelly",
    purrpleCat,
    "https://freemusicarchive.org/music/purrple-cat/a-good-book/coffee-jelly/",
    "CC-BY-4.0",
  ),
  track(
    "Another Dimension",
    purrpleCat,
    "https://freemusicarchive.org/music/purrple-cat/a-good-book/another-dimension/",
    "CC-BY-4.0",
  ),
  track(
    "lo-fi relax",
    melatronic,
    "https://freemusicarchive.org/music/melatronic-1/stylish-hip-hop/lo-fi-relax-1/",
    "CC-BY-4.0",
  ),
];

/** HoliznaCC0 public-domain tracks. Credit is a courtesy. */
export const publicDomainTracks: CreditTrack[] = [
  track(
    "One Night In France ( Lofi, Nostalgic, Chill )",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/one-night-in-france-lofi-nostalgic-chill/",
    "CC0-1.0",
  ),
  track(
    "Tokyo Sunset ( Lofi , Peaceful , Soft )",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/tokyo-sunset-lofi-peaceful-soft/",
    "CC0-1.0",
  ),
  track(
    "Theta Frequency ( Lofi , Chill , Calm )",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/theta-frequency-lofi-chill-calm/",
    "CC0-1.0",
  ),
  track(
    "Lucid ( Lofi , Dreamy , Chill )",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/lucid-lofi-dreamy-chill/",
    "CC0-1.0",
  ),
  track(
    "Calm Currents ( Lofi , Relax , Calm )",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/calm-currents-lofi-relax-calm/",
    "CC0-1.0",
  ),
  track(
    "Moon Unit ( Lofi , Reflection , Dreamy )",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/moon-unit-lofi-reflection-dreamy/",
    "CC0-1.0",
  ),
  track(
    "Ocean Memory",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/ocean-memory-lo-fi-chill/ocean-memory/",
    "CC0-1.0",
  ),
  track(
    "Washed Up",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/ocean-memory-lo-fi-chill/washed-up/",
    "CC0-1.0",
  ),
  track(
    "Cold (Salt) Water",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/ocean-memory-lo-fi-chill/cold-salt-water/",
    "CC0-1.0",
  ),
  track(
    "Currents We Used to Know",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/ocean-memory-lo-fi-chill/currents-we-used-to-know/",
    "CC0-1.0",
  ),
  track(
    "I Don't Understand A Thing",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/ocean-memory-lo-fi-chill/i-dont-understand-a-thing/",
    "CC0-1.0",
  ),
  track(
    "Roof Tops",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/summer-air-lo-fi/roof-tops/",
    "CC0-1.0",
  ),
  track(
    "Summer Felt Longer Then",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/summer-air-lo-fi/summer-felt-longer-then/",
    "CC0-1.0",
  ),
  track(
    "The Last Long Day",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/summer-air-lo-fi/the-last-long-day/",
    "CC0-1.0",
  ),
  track(
    "August Never Lasts",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/summer-air-lo-fi/august-never-lasts/",
    "CC0-1.0",
  ),
  track(
    "Faded in the Sunlight",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/summer-air-lo-fi/faded-in-the-sunlight/",
    "CC0-1.0",
  ),
  track(
    "When Time Called Me Darling",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/when-time-called-me-darling-lofi-relaxing-chill/",
    "CC0-1.0",
  ),
  track(
    "Still Life",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/still-life-lofi-chill-nostalgic/",
    "CC0-1.0",
  ),
  track(
    "Tranquil Mindscape",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/tranquil-mindscape-lofi-happy-reflection/",
    "CC0-1.0",
  ),
  track(
    "Birds",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/birds-lofi-chill/",
    "CC0-1.0",
  ),
  track(
    "Waiting Around",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/waiting-around-lofi-calm/",
    "CC0-1.0",
  ),
  track(
    "Shimmer",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/shimmer-lofi-chill/",
    "CC0-1.0",
  ),
  track(
    "Warm Fuzz",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/warm-fuzz-lofi-retro/",
    "CC0-1.0",
  ),
  track(
    "Ode To Forgetting",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/ode-to-forgetting-lofi-chill-relax/",
    "CC0-1.0",
  ),
  track(
    "Wave Maker",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/wave-maker-lofi-dreamy-retro/",
    "CC0-1.0",
  ),
  track(
    "Ease into Night",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/ease-into-night-lofi-relax-chill/",
    "CC0-1.0",
  ),
  track(
    "Dreamy Reverie",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/dreamy-reverie-lofi-nostalgic-chill/",
    "CC0-1.0",
  ),
  track(
    "Infinite Echoes",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/infinite-echoes-lofi-dreamy-soft/",
    "CC0-1.0",
  ),
  track(
    "Wetlands",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/wetlands-lofi-calm-relaxed/",
    "CC0-1.0",
  ),
  track(
    "Color Of A Soul",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/color-of-a-soul-lofi-calm-nostalgic/",
    "CC0-1.0",
  ),
];

export const libraryTracks: CreditTrack[] = [...attributionTracks, ...publicDomainTracks];

const libraryTrackUrls = new Set(libraryTracks.map((item) => item.trackUrl));

export function isLibraryTrackPage(url: string | undefined): boolean {
  const safe = pageUrl(url);
  return safe !== null && libraryTrackUrls.has(safe);
}

function assertLibrary(): void {
  const counts = { "CC-BY-3.0": 0, "CC-BY-4.0": 0, "CC0-1.0": 0 };
  for (const item of libraryTracks) {
    counts[item.licence] += 1;
    const deed = licenceDeeds[item.licence];
    if (!deed?.url || !pageUrl(deed.url)) throw new Error(`Missing deed for ${item.title}`);
    if (!item.artist.url || !pageUrl(item.artist.url)) throw new Error(`Missing artist page for ${item.title}`);
    if (item.artist.name === "Purrple Cat" && item.artist.creditLine !== PURRPLE_CAT_LINE) {
      throw new Error(`Purrple Cat credit line missing on ${item.title}`);
    }
    if (item.artist.name !== "Purrple Cat" && item.artist.creditLine) {
      throw new Error(`Unexpected credit line on ${item.title}`);
    }
  }
  if (libraryTracks.length !== 39) throw new Error(`Expected 39 tracks, found ${libraryTracks.length}`);
  if (attributionTracks.length !== 9) throw new Error(`Expected 9 attribution tracks, found ${attributionTracks.length}`);
  if (publicDomainTracks.length !== 30) throw new Error(`Expected 30 public-domain tracks, found ${publicDomainTracks.length}`);
  if (counts["CC-BY-3.0"] !== 5 || counts["CC-BY-4.0"] !== 4 || counts["CC0-1.0"] !== 30) {
    throw new Error(`Unexpected licence counts: ${JSON.stringify(counts)}`);
  }
  if (libraryTrackUrls.size !== libraryTracks.length) throw new Error("Duplicate track page in the library");
  const lineUrl = PURRPLE_CAT_LINE.match(/https:\/\/\S+/)?.[0];
  if (lineUrl !== "https://purrplecat.com/" || !pageUrl(lineUrl)) {
    throw new Error("Purrple Cat credit line must link to https://purrplecat.com/");
  }
  const dumped = JSON.stringify(libraryTracks);
  if (/\.mp3\b|files\.freemusicarchive\.org|azuracast/i.test(dumped)) {
    throw new Error("Library credits include a forbidden audio or internal reference");
  }
}

assertLibrary();
