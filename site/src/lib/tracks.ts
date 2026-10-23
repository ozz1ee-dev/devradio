import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export type CatalogueTrack = {
  id: string;
  title?: string;
  artist?: string;
  licence?: string;
  source_url?: string;
  audio_url?: string;
};

function isTrack(value: unknown): value is CatalogueTrack {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as CatalogueTrack).id === "string"
  );
}

/** Read tracks/index.json from the repository root at build time. */
export function loadTracks(): CatalogueTrack[] {
  const indexPath = fileURLToPath(new URL("../../../tracks/index.json", import.meta.url));
  const data = JSON.parse(readFileSync(indexPath, "utf8")) as { tracks?: unknown };
  if (!Array.isArray(data.tracks)) return [];
  return data.tracks.filter(isTrack);
}

export function httpUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
  } catch {
    return null;
  }
  return null;
}
