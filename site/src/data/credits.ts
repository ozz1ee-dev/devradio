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
  "CC-BY-3.0-US": {
    name: "CC BY 3.0 US",
    url: "https://creativecommons.org/licenses/by/3.0/us/",
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

export type LibraryLicence = "CC-BY-3.0" | "CC-BY-3.0-US" | "CC-BY-4.0" | "CC0-1.0";

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
const kaizanBlu = artist("KaizanBlu", "https://freemusicarchive.org/music/kaizanblu/");
const terrapastel = artist("Terrapastel", "https://freemusicarchive.org/music/terrapastel/");
const mindsEye = artist("MindsEye", "https://freemusicarchive.org/music/MindsEye/");
const avapXia = artist("AvapXia", "https://freemusicarchive.org/music/avapxia/");
const loFiAstronaut = artist("Lo-Fi Astronaut", "https://freemusicarchive.org/music/lo-fi-astronaut/");
const serat = artist("Serat", "https://freemusicarchive.org/music/serat/");
const loyaltyFreak = artist("Loyalty Freak Music", "https://freemusicarchive.org/music/Loyalty_Freak_Music/");
const koiDiscovery = artist("Koi-discovery", "https://freemusicarchive.org/music/koi-discovery/");
const pamelaYuen = artist("Pamela Yuen", "https://freemusicarchive.org/music/pamela-yuen/");
const leeRosevere = artist("Lee Rosevere", "https://freemusicarchive.org/music/lee-rosevere/");
const jmhbm = artist("JMHBM", "https://freemusicarchive.org/music/beat-mekanik/");

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
  track(
    "Flicker",
    kaizanBlu,
    "https://freemusicarchive.org/music/kaizanblu/single/flicker/",
    "CC-BY-4.0",
  ),
  track(
    "Pastel",
    kaizanBlu,
    "https://freemusicarchive.org/music/kaizanblu/single/pastel/",
    "CC-BY-4.0",
  ),
  track(
    "Serein",
    kaizanBlu,
    "https://freemusicarchive.org/music/kaizanblu/single/serein/",
    "CC-BY-4.0",
  ),
  track(
    "Thorne",
    kaizanBlu,
    "https://freemusicarchive.org/music/kaizanblu/single/thorne/",
    "CC-BY-4.0",
  ),
  track(
    "Tōzai",
    kaizanBlu,
    "https://freemusicarchive.org/music/kaizanblu/single/tozai-1/",
    "CC-BY-4.0",
  ),
  track(
    "Saturn",
    kaizanBlu,
    "https://freemusicarchive.org/music/kaizanblu/single/saturn-3/",
    "CC-BY-4.0",
  ),
  track(
    "Coasting",
    kaizanBlu,
    "https://freemusicarchive.org/music/kaizanblu/single/coasting-1/",
    "CC-BY-4.0",
  ),
  track(
    "Let Go",
    kaizanBlu,
    "https://freemusicarchive.org/music/kaizanblu/single/let-go/",
    "CC-BY-4.0",
  ),
  track(
    "Print",
    terrapastel,
    "https://freemusicarchive.org/music/terrapastel/what-wonder/print/",
    "CC-BY-4.0",
  ),
  track(
    "Cave Before Time",
    terrapastel,
    "https://freemusicarchive.org/music/terrapastel/what-wonder/cave-before-time/",
    "CC-BY-4.0",
  ),
  track(
    "Countful",
    terrapastel,
    "https://freemusicarchive.org/music/terrapastel/what-wonder/countful/",
    "CC-BY-4.0",
  ),
  track(
    "Request",
    terrapastel,
    "https://freemusicarchive.org/music/terrapastel/what-wonder/request/",
    "CC-BY-4.0",
  ),
  track(
    "Squoze",
    terrapastel,
    "https://freemusicarchive.org/music/terrapastel/what-wonder/squoze/",
    "CC-BY-4.0",
  ),
  track(
    "Two Ears",
    terrapastel,
    "https://freemusicarchive.org/music/terrapastel/what-wonder/two-ears/",
    "CC-BY-4.0",
  ),
  track(
    "Express",
    terrapastel,
    "https://freemusicarchive.org/music/terrapastel/what-wonder/express/",
    "CC-BY-4.0",
  ),
  track(
    "Atlantic",
    mindsEye,
    "https://freemusicarchive.org/music/MindsEye/single/atlantic/",
    "CC-BY-4.0",
  ),
  track(
    "Coastal",
    mindsEye,
    "https://freemusicarchive.org/music/MindsEye/single/coastal/",
    "CC-BY-4.0",
  ),
  track(
    "Merging Currents",
    mindsEye,
    "https://freemusicarchive.org/music/MindsEye/single/merging-currents/",
    "CC-BY-4.0",
  ),
  track(
    "Spores - Instrumental",
    mindsEye,
    "https://freemusicarchive.org/music/MindsEye/single/spores-instrumental/",
    "CC-BY-4.0",
  ),
  track(
    "Ignorance is Bliss",
    mindsEye,
    "https://freemusicarchive.org/music/MindsEye/single/ignorance-is-bliss/",
    "CC-BY-4.0",
  ),
  track(
    "heat wave",
    avapXia,
    "https://freemusicarchive.org/music/avapxia/summer-lofi/heat-wave/",
    "CC-BY-4.0",
  ),
  track(
    "it's perfect weather for a trip to the café, don't you think?",
    avapXia,
    "https://freemusicarchive.org/music/avapxia/summer-lofi/its-perfect-weather-for-a-trip-to-the-cafe-dont-you-think/",
    "CC-BY-4.0",
  ),
  track(
    "longing to be somebody else",
    avapXia,
    "https://freemusicarchive.org/music/avapxia/summer-lofi/longing-to-be-somebody-else/",
    "CC-BY-4.0",
  ),
  track(
    "resetting my sleep schedule",
    avapXia,
    "https://freemusicarchive.org/music/avapxia/summer-lofi/resetting-my-sleep-schedule/",
    "CC-BY-4.0",
  ),
  track(
    "Phasing",
    loFiAstronaut,
    "https://freemusicarchive.org/music/lo-fi-astronaut/lo-fi-and-beyond/phasing-lofi-peaceful/",
    "CC-BY-4.0",
  ),
  track(
    "Analog",
    loFiAstronaut,
    "https://freemusicarchive.org/music/lo-fi-astronaut/lo-fi-and-beyond/analog-lofi-hopeful/",
    "CC-BY-4.0",
  ),
  track(
    "All of a Sudden",
    serat,
    "https://freemusicarchive.org/music/serat/flow-sessions/all-of-a-sudden/",
    "CC-BY-4.0",
  ),
  track(
    "Atmo People",
    serat,
    "https://freemusicarchive.org/music/serat/flow-sessions/atmo-people/",
    "CC-BY-4.0",
  ),
  track(
    "Much Less Sense",
    serat,
    "https://freemusicarchive.org/music/serat/flow-sessions/much-less-sense/",
    "CC-BY-4.0",
  ),
  track(
    "Out of Bounds",
    serat,
    "https://freemusicarchive.org/music/serat/flow-sessions/out-of-bounds/",
    "CC-BY-4.0",
  ),
  track(
    "Emergence",
    serat,
    "https://freemusicarchive.org/music/serat/flow-sessions/emergence/",
    "CC-BY-4.0",
  ),
  track(
    "A Balloon In The Sky",
    loFiAstronaut,
    "https://freemusicarchive.org/music/lo-fi-astronaut/lo-fi-and-beyond/a-balloon-in-the-sky-lofi-nostalgic/",
    "CC-BY-4.0",
  ),
  track(
    "Design For Dreaming",
    loFiAstronaut,
    "https://freemusicarchive.org/music/lo-fi-astronaut/lo-fi-and-beyond/design-for-dreaming-lofi-relaxing/",
    "CC-BY-4.0",
  ),
  track(
    "Artificial Rain",
    loFiAstronaut,
    "https://freemusicarchive.org/music/lo-fi-astronaut/lo-fi-and-beyond/artificial-rain-lof-i-chill/",
    "CC-BY-4.0",
  ),
  track(
    "Attic Of The Universe",
    loFiAstronaut,
    "https://freemusicarchive.org/music/lo-fi-astronaut/lo-fi-and-beyond/attic-of-the-universe-lofi-retro/",
    "CC-BY-4.0",
  ),
  track(
    "Autumn In The Air",
    loFiAstronaut,
    "https://freemusicarchive.org/music/lo-fi-astronaut/lo-fi-and-beyond/autumn-in-the-air-lofi-nostalgic/",
    "CC-BY-4.0",
  ),
  track(
    "Paws For A While",
    pamelaYuen,
    "https://freemusicarchive.org/music/pamela-yuen/indie-chillout/paws-for-a-while/",
    "CC-BY-4.0",
  ),
  track(
    "The Last Of Illusions",
    pamelaYuen,
    "https://freemusicarchive.org/music/pamela-yuen/indie-chillout/the-last-of-illusions/",
    "CC-BY-4.0",
  ),
  track(
    "Playtime",
    pamelaYuen,
    "https://freemusicarchive.org/music/pamela-yuen/indie-chillout/playtime/",
    "CC-BY-4.0",
  ),
  track(
    "Dream Diary",
    pamelaYuen,
    "https://freemusicarchive.org/music/pamela-yuen/indie-chillout/dream-diary/",
    "CC-BY-4.0",
  ),
  track(
    "The Hunger Within",
    pamelaYuen,
    "https://freemusicarchive.org/music/pamela-yuen/indie-chillout/the-hunger-within/",
    "CC-BY-4.0",
  ),
  track(
    "No Map, Only Light",
    pamelaYuen,
    "https://freemusicarchive.org/music/pamela-yuen/indie-chillout/no-map-only-light/",
    "CC-BY-4.0",
  ),
  track(
    "Evening Glow",
    leeRosevere,
    "https://freemusicarchive.org/music/lee-rosevere/music-for-podcasts-beats/evening-glow/",
    "CC-BY-4.0",
  ),
  track(
    "Heat Haze",
    leeRosevere,
    "https://freemusicarchive.org/music/lee-rosevere/music-for-podcasts-beats/heat-haze/",
    "CC-BY-4.0",
  ),
  track(
    "Going Home",
    leeRosevere,
    "https://freemusicarchive.org/music/lee-rosevere/music-for-podcasts-beats/going-home-1/",
    "CC-BY-4.0",
  ),
  track(
    "Places Unseen",
    leeRosevere,
    "https://freemusicarchive.org/music/lee-rosevere/music-for-podcasts-beats/places-unseen/",
    "CC-BY-4.0",
  ),
  track(
    "Looking Back",
    leeRosevere,
    "https://freemusicarchive.org/music/lee-rosevere/music-for-podcasts-beats/looking-back-3/",
    "CC-BY-4.0",
  ),
  track(
    "Keeping Stuff Together",
    leeRosevere,
    "https://freemusicarchive.org/music/lee-rosevere/music-for-podcasts-beats/keeping-stuff-together/",
    "CC-BY-4.0",
  ),
  track(
    "Last Call",
    leeRosevere,
    "https://freemusicarchive.org/music/lee-rosevere/music-for-podcasts-beats/last-call/",
    "CC-BY-4.0",
  ),
  track(
    "Content",
    leeRosevere,
    "https://freemusicarchive.org/music/lee-rosevere/music-for-podcasts-beats/content/",
    "CC-BY-4.0",
  ),
  track(
    "Going in circles",
    leeRosevere,
    "https://freemusicarchive.org/music/lee-rosevere/music-for-podcasts-beats/going-in-circles/",
    "CC-BY-4.0",
  ),
  track(
    "You're Enough (version b)",
    leeRosevere,
    "https://freemusicarchive.org/music/lee-rosevere/music-for-podcasts-beats/youre-enough-version-b/",
    "CC-BY-4.0",
  ),
  track(
    "Moonrise",
    jmhbm,
    "https://freemusicarchive.org/music/beat-mekanik/single/moonrise/",
    "CC-BY-4.0",
  ),
  track(
    "Something Elated",
    brokeForFree,
    "https://freemusicarchive.org/music/Broke_For_Free/Something_EP/Broke_For_Free_-_Something_EP_-_05_Something_Elated/",
    "CC-BY-3.0-US",
  ),
];

/** Public-domain tracks. Credit is a courtesy. */
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
  track(
    "Kodama",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/nature-spirit/kodama/",
    "CC0-1.0",
  ),
  track(
    "Kitsune",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/nature-spirit/kitsune/",
    "CC0-1.0",
  ),
  track(
    "Tengu",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/nature-spirit/tengu/",
    "CC0-1.0",
  ),
  track(
    "Tanuki",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/nature-spirit/tanuki/",
    "CC0-1.0",
  ),
  track(
    "Tsukumogami",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/nature-spirit/tsukumogami/",
    "CC0-1.0",
  ),
  track(
    "Yuki-onna",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/nature-spirit/yuki-onna/",
    "CC0-1.0",
  ),
  track(
    "Feeling Human Again",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/spring-woke-me-up/feeling-human-again/",
    "CC0-1.0",
  ),
  track(
    "Toy Box",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/spring-woke-me-up/toy-box/",
    "CC0-1.0",
  ),
  track(
    "Foley Of Man",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/spring-woke-me-up/foley-of-man/",
    "CC0-1.0",
  ),
  track(
    "Hope On Repeat",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/spring-woke-me-up/hope-on-repeat/",
    "CC0-1.0",
  ),
  track(
    "Spring In Sight",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/spring-woke-me-up/spring-in-sight/",
    "CC0-1.0",
  ),
  track(
    "Seasonal Depression",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/spring-woke-me-up/seasonal-depression/",
    "CC0-1.0",
  ),
  track(
    "2 Hour Delay",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/winter-lofi/2-hour-delay-1/",
    "CC0-1.0",
  ),
  track(
    "Winter Blues",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/winter-lofi/winter-blues/",
    "CC0-1.0",
  ),
  track(
    "First Snow",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/winter-lofi/first-snowmp3/",
    "CC0-1.0",
  ),
  track(
    "Snow Drift",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/winter-lofi/snow-drift/",
    "CC0-1.0",
  ),
  track(
    "Fire Place",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/winter-lofi/fire-place/",
    "CC0-1.0",
  ),
  track(
    "Windows Down",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/lazy-summer-lofi-1/windows-downmp3/",
    "CC0-1.0",
  ),
  track(
    "Blue Skies",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/lazy-summer-lofi-1/blue-skiesmp3/",
    "CC0-1.0",
  ),
  track(
    "Laundry On The Wire",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/lazy-summer-lofi-1/laundry-on-the-wiremp3/",
    "CC0-1.0",
  ),
  track(
    "Waves",
    holizna,
    "https://freemusicarchive.org/music/holiznacc0/lazy-summer-lofi-1/wavesmp3/",
    "CC0-1.0",
  ),
  track(
    "Coexistenz",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/TO_CHILL_AND_STAY_AWAKE/Loyalty_Freak_Music_-_TO_CHILL_AND_STAY_AWAKE_-_01_Coexistenz/",
    "CC0-1.0",
  ),
  track(
    "Everyone",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/TO_CHILL_AND_STAY_AWAKE/Loyalty_Freak_Music_-_TO_CHILL_AND_STAY_AWAKE_-_02_Everyone/",
    "CC0-1.0",
  ),
  track(
    "Chillin with a drink at the club",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/TO_CHILL_AND_STAY_AWAKE/Loyalty_Freak_Music_-_TO_CHILL_AND_STAY_AWAKE_-_03_Chillin_with_a_drink_at_the_club/",
    "CC0-1.0",
  ),
  track(
    "You know why",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/TO_CHILL_AND_STAY_AWAKE/Loyalty_Freak_Music_-_TO_CHILL_AND_STAY_AWAKE_-_04_You_know_why/",
    "CC0-1.0",
  ),
  track(
    "Traveling in your mind",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/TO_CHILL_AND_STAY_AWAKE/Loyalty_Freak_Music_-_TO_CHILL_AND_STAY_AWAKE_-_05_Traveling_in_your_mind/",
    "CC0-1.0",
  ),
  track(
    "People are spinning",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/TO_CHILL_AND_STAY_AWAKE/Loyalty_Freak_Music_-_TO_CHILL_AND_STAY_AWAKE_-_06_People_are_spinning/",
    "CC0-1.0",
  ),
  track(
    "Monarch of the street",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/TO_CHILL_AND_STAY_AWAKE/Loyalty_Freak_Music_-_TO_CHILL_AND_STAY_AWAKE_-_07_Monarch_of_the_street/",
    "CC0-1.0",
  ),
  track(
    "Sweet You",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MELODIES_WITH_A_BEAT/Loyalty_Freak_Music_-_MELODIES_WITH_A_BEAT_-_01_Sweet_You/",
    "CC0-1.0",
  ),
  track(
    "Old Saga",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MELODIES_WITH_A_BEAT/Loyalty_Freak_Music_-_MELODIES_WITH_A_BEAT_-_02_Old_Saga/",
    "CC0-1.0",
  ),
  track(
    "Love They",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MELODIES_WITH_A_BEAT/Loyalty_Freak_Music_-_MELODIES_WITH_A_BEAT_-_05_Love_They/",
    "CC0-1.0",
  ),
  track(
    "Softly",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MELODIES_WITH_A_BEAT/Loyalty_Freak_Music_-_MELODIES_WITH_A_BEAT_-_06_Softly/",
    "CC0-1.0",
  ),
  track(
    "Sweet Me",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MELODIES_WITH_A_BEAT/Loyalty_Freak_Music_-_MELODIES_WITH_A_BEAT_-_07_Sweet_Me/",
    "CC0-1.0",
  ),
  track(
    "Beach",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MELODIES_WITH_A_BEAT/Loyalty_Freak_Music_-_MELODIES_WITH_A_BEAT_-_08_Beach/",
    "CC0-1.0",
  ),
  track(
    "Hangover",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MELODIES_WITH_A_BEAT/Loyalty_Freak_Music_-_MELODIES_WITH_A_BEAT_-_10_Hangover/",
    "CC0-1.0",
  ),
  track(
    "Sweet They",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MELODIES_WITH_A_BEAT/Loyalty_Freak_Music_-_MELODIES_WITH_A_BEAT_-_14_Sweet_They/",
    "CC0-1.0",
  ),
  track(
    "Once more with you",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MINIMAL_AMBIENT_BOUNCE/Loyalty_Freak_Music_-_MINIMAL_AMBIENT_BOUNCE_-_01_Once_more_with_you/",
    "CC0-1.0",
  ),
  track(
    "One Cool Minute",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MINIMAL_AMBIENT_BOUNCE/Loyalty_Freak_Music_-_MINIMAL_AMBIENT_BOUNCE_-_02_One_Cool_Minute/",
    "CC0-1.0",
  ),
  track(
    "Old Key",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MINIMAL_AMBIENT_BOUNCE/Loyalty_Freak_Music_-_MINIMAL_AMBIENT_BOUNCE_-_03_Old_Key/",
    "CC0-1.0",
  ),
  track(
    "Static Shoes",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MINIMAL_AMBIENT_BOUNCE/Loyalty_Freak_Music_-_MINIMAL_AMBIENT_BOUNCE_-_04_Static_Shoes/",
    "CC0-1.0",
  ),
  track(
    "Waiting TTTT",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MINIMAL_AMBIENT_BOUNCE/Loyalty_Freak_Music_-_MINIMAL_AMBIENT_BOUNCE_-_05_Waiting_TTTT/",
    "CC0-1.0",
  ),
  track(
    "Lag",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MINIMAL_AMBIENT_BOUNCE/Loyalty_Freak_Music_-_MINIMAL_AMBIENT_BOUNCE_-_06_Lag/",
    "CC0-1.0",
  ),
  track(
    "No Cadillac",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MINIMAL_AMBIENT_BOUNCE/Loyalty_Freak_Music_-_MINIMAL_AMBIENT_BOUNCE_-_07_No_Cadillac/",
    "CC0-1.0",
  ),
  track(
    "Love Him",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MELODIES_WITH_A_BEAT/Loyalty_Freak_Music_-_MELODIES_WITH_A_BEAT_-_03_Love_Him/",
    "CC0-1.0",
  ),
  track(
    "Love Her",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MELODIES_WITH_A_BEAT/Loyalty_Freak_Music_-_MELODIES_WITH_A_BEAT_-_04_Love_Her/",
    "CC0-1.0",
  ),
  track(
    "Shoepop",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MELODIES_WITH_A_BEAT/Loyalty_Freak_Music_-_MELODIES_WITH_A_BEAT_-_09_Shoepop/",
    "CC0-1.0",
  ),
  track(
    "Standing",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MELODIES_WITH_A_BEAT/Loyalty_Freak_Music_-_MELODIES_WITH_A_BEAT_-_11_Standing/",
    "CC0-1.0",
  ),
  track(
    "Untitled",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MELODIES_WITH_A_BEAT/Loyalty_Freak_Music_-_MELODIES_WITH_A_BEAT_-_12_Untitled/",
    "CC0-1.0",
  ),
  track(
    "Work",
    loyaltyFreak,
    "https://freemusicarchive.org/music/Loyalty_Freak_Music/MELODIES_WITH_A_BEAT/Loyalty_Freak_Music_-_MELODIES_WITH_A_BEAT_-_13_Work/",
    "CC0-1.0",
  ),
  track(
    "Thrusly_Marylin",
    koiDiscovery,
    "https://freemusicarchive.org/music/koi-discovery/ante-chrysalide/thrusly-marylinmp3/",
    "CC0-1.0",
  ),
];

export const libraryTracks: CreditTrack[] = [...attributionTracks, ...publicDomainTracks];

/** Public-domain tracks in catalogue order, one group per artist. */
export const publicDomainGroups: { artist: CreditArtist; tracks: CreditTrack[] }[] = [];

for (const item of publicDomainTracks) {
  const last = publicDomainGroups[publicDomainGroups.length - 1];
  if (last && last.artist === item.artist) last.tracks.push(item);
  else publicDomainGroups.push({ artist: item.artist, tracks: [item] });
}

const libraryTrackUrls = new Set(libraryTracks.map((item) => item.trackUrl));

export function isLibraryTrackPage(url: string | undefined): boolean {
  const safe = pageUrl(url);
  return safe !== null && libraryTrackUrls.has(safe);
}

function assertLibrary(): void {
  const counts = { "CC-BY-3.0": 0, "CC-BY-3.0-US": 0, "CC-BY-4.0": 0, "CC0-1.0": 0 };
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
  if (libraryTracks.length !== 143) throw new Error(`Expected 143 tracks, found ${libraryTracks.length}`);
  if (attributionTracks.length !== 63) throw new Error(`Expected 63 attribution tracks, found ${attributionTracks.length}`);
  if (publicDomainTracks.length !== 80) throw new Error(`Expected 80 public-domain tracks, found ${publicDomainTracks.length}`);
  if (
    counts["CC-BY-3.0"] !== 5 ||
    counts["CC-BY-3.0-US"] !== 1 ||
    counts["CC-BY-4.0"] !== 57 ||
    counts["CC0-1.0"] !== 80
  ) {
    throw new Error(`Unexpected licence counts: ${JSON.stringify(counts)}`);
  }
  const groupSummary = publicDomainGroups
    .map((group) => `${group.artist.name}:${group.tracks.length}`)
    .join(",");
  if (groupSummary !== "HoliznaCC0:51,Loyalty Freak Music:28,Koi-discovery:1") {
    throw new Error(`Unexpected public-domain groups: ${groupSummary}`);
  }
  if (libraryTrackUrls.size !== libraryTracks.length) throw new Error("Duplicate track page in the library");
  const lineUrl = PURRPLE_CAT_LINE.match(/https:\/\/\S+/)?.[0];
  if (lineUrl !== "https://purrplecat.com/" || !pageUrl(lineUrl)) {
    throw new Error("Purrple Cat credit line must link to https://purrplecat.com/");
  }
  const dumped = JSON.stringify(libraryTracks);
  if (/\.mp3\b|files\.freemusicarchive\.org|azuracast|bartmann/i.test(dumped)) {
    throw new Error("Library credits include a forbidden audio, internal, or excluded reference");
  }
}

assertLibrary();
