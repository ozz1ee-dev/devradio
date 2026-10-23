import { copyFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dist = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");
const index = resolve(dist, "sitemap-index.xml");
const target = resolve(dist, "sitemap.xml");

if (!existsSync(index)) {
  throw new Error(`Missing ${index}. @astrojs/sitemap did not write a sitemap index.`);
}

copyFileSync(index, target);
console.log("Published dist/sitemap.xml from sitemap-index.xml");
