import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const origin = "https://devradio.co.uk";
const canonical = `${origin}/`;
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  const path = resolve(dist, relativePath);
  if (!existsSync(path)) {
    fail(`missing dist/${relativePath}`);
    return "";
  }
  return readFileSync(path, "utf8");
}

function attrs(raw) {
  const out = {};
  for (const match of raw.matchAll(/([:@\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    out[match[1].toLowerCase()] = match[2] ?? match[3];
  }
  return out;
}

function elements(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, "gi"))].map((match) => attrs(match[1]));
}

function meta(html, key, value) {
  return elements(html, "meta").find((item) => item[key] === value);
}

function requireMeta(html, key, name, expected) {
  const tag = meta(html, key, name);
  if (!tag) {
    fail(`missing meta ${key}=${name}`);
    return;
  }
  if (expected !== undefined && tag.content !== expected) {
    fail(`meta ${name} is ${JSON.stringify(tag.content)}, expected ${JSON.stringify(expected)}`);
  }
}

function pngSize(relativePath) {
  const bytes = readFileSync(resolve(dist, relativePath));
  if (bytes.subarray(0, 8).toString("binary") !== "\x89PNG\r\n\x1a\n") {
    fail(`${relativePath} is not a PNG`);
    return { width: 0, height: 0, bytes: bytes.length };
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    bytes: bytes.length,
  };
}

const html = read("index.html");
const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
if (!title) fail("missing title");
if (title.length < 15 || title.length > 60) fail(`title length ${title.length} is outside 15–60`);

const description = meta(html, "name", "description")?.content ?? "";
if (description.length < 120 || description.length > 170) {
  fail(`description length ${description.length} is outside 120–170`);
}

if (!/<html\b[^>]*\blang="en"/i.test(html)) fail('missing <html lang="en">');
const h1s = html.match(/<h1\b/gi) ?? [];
if (h1s.length !== 1) fail(`expected exactly one h1, found ${h1s.length}`);

const headings = [...html.matchAll(/<h([1-6])\b/gi)].map((match) => Number(match[1]));
let previous = 0;
for (const level of headings) {
  if (previous && level > previous + 1) fail(`heading level jumps from h${previous} to h${level}`);
  previous = level;
}

for (const image of elements(html, "img")) {
  if (!("alt" in image)) fail("img missing alt");
  if (!image.width || !image.height) fail("img missing width or height");
}

for (const link of [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)]) {
  const text = link[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const label = attrs(link[1])["aria-label"];
  if (!text && !label) fail(`link has no text: ${link[0].slice(0, 120)}`);
  if (/^(click here|here|link)$/i.test(text)) fail(`vague link text: ${text}`);
}

const canonicals = elements(html, "link").filter((link) => link.rel === "canonical");
if (canonicals.length !== 1) fail(`expected one canonical, found ${canonicals.length}`);
if (canonicals[0]?.href !== canonical) fail(`canonical is ${canonicals[0]?.href}`);
if (html.includes(`${origin}//`) || html.includes(`${origin}/index.html`)) {
  fail("duplicate trailing-slash or index.html URL");
}

requireMeta(html, "name", "robots", "index, follow");
requireMeta(html, "name", "theme-color", "#1a1b26");
const viewport = meta(html, "name", "viewport")?.content ?? "";
if (!viewport.includes("width=device-width")) fail(`viewport is ${viewport}`);

requireMeta(html, "property", "og:type", "website");
requireMeta(html, "property", "og:site_name", "DevRadio");
requireMeta(html, "property", "og:title", title);
requireMeta(html, "property", "og:description", description);
requireMeta(html, "property", "og:url", canonical);
requireMeta(html, "property", "og:locale", "en_GB");
requireMeta(html, "property", "og:image", `${origin}/og/devradio-og.png`);
requireMeta(html, "property", "og:image:width", "1200");
requireMeta(html, "property", "og:image:height", "630");
requireMeta(html, "property", "og:image:alt", "DevRadio. Lo-fi beats. AI news, slowed down.");
requireMeta(html, "property", "og:image:type", "image/png");
requireMeta(html, "name", "twitter:card", "summary_large_image");
requireMeta(html, "name", "twitter:title", title);
requireMeta(html, "name", "twitter:description", description);
requireMeta(html, "name", "twitter:image", `${origin}/og/devradio-og.png`);
requireMeta(html, "name", "twitter:image:alt", "DevRadio. Lo-fi beats. AI news, slowed down.");

for (const name of ["og:image", "og:url", "twitter:image"]) {
  const key = name.startsWith("twitter") ? "name" : "property";
  const value = meta(html, key, name)?.content ?? "";
  if (!value.startsWith(`${origin}/`)) fail(`${name} is not an absolute site URL: ${value}`);
}

const rss = elements(html, "link").find((link) => link.rel === "alternate" && link.type === "application/rss+xml");
if (rss?.href !== `${origin}/feed.xml`) fail(`RSS alternate is ${rss?.href}`);

const icons = elements(html, "link").filter((link) => link.rel === "icon" || link.rel === "apple-touch-icon");
if (!icons.some((link) => link.href?.endsWith("favicon.svg"))) fail("missing SVG favicon link");
if (!icons.some((link) => link.href?.endsWith("favicon-32.png"))) fail("missing 32px favicon link");
if (!icons.some((link) => link.rel === "apple-touch-icon")) fail("missing apple-touch-icon link");
if (!elements(html, "link").some((link) => link.rel === "manifest")) fail("missing manifest link");

const jsonMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!jsonMatch) fail("missing JSON-LD");
let graph = [];
try {
  const data = JSON.parse(jsonMatch?.[1] ?? "");
  if (data["@context"] !== "https://schema.org" || !Array.isArray(data["@graph"])) {
    fail("JSON-LD is not a schema.org @graph");
  }
  graph = data["@graph"] ?? [];
} catch (error) {
  fail(`JSON-LD did not parse: ${error.message}`);
}

function nodeOf(type) {
  return graph.find((node) => node["@type"] === type);
}

for (const type of ["WebSite", "Organization", "RadioStation"]) {
  const node = nodeOf(type);
  if (!node) {
    fail(`JSON-LD missing ${type}`);
    continue;
  }
  if (node.name !== "DevRadio") fail(`${type} name is ${node.name}`);
  if (node.url !== canonical) fail(`${type} url is ${node.url}`);
  if (type !== "Organization" && node.inLanguage !== "en") fail(`${type} inLanguage is ${node.inLanguage}`);
  if (type === "RadioStation" && node.logo !== `${origin}/apple-touch-icon.png`) {
    fail(`RadioStation logo is ${node.logo}`);
  }
  const banned = ["address", "telephone", "phone", "aggregateRating", "review", "sameAs", "email"];
  for (const key of banned) {
    if (key in node) fail(`${type} includes ${key}`);
  }
}

const playoutProduct = "azu" + "racast";
if (html.toLowerCase().includes(playoutProduct)) fail("page mentions the playout product");

const css = readFileSync(resolve(dist, [...readFileSync(resolve(dist, "index.html"), "utf8").matchAll(/href="([^"]+\.css)"/g)].map((match) => match[1].replace(/^\//, ""))[0] ?? ""), "utf8");
const faces = css.match(/@font-face\s*{[^}]*}/g) ?? [];
if (faces.length < 1) fail("no @font-face rules");
for (const face of faces) {
  if (!/font-display:\s*swap/.test(face)) fail(`font-face missing font-display: swap: ${face.slice(0, 80)}`);
}

const robots = read("robots.txt");
if (!/User-agent:\s*\*/.test(robots) || !/Allow:\s*\//.test(robots)) fail("robots.txt does not allow everything");
if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) fail("robots.txt sitemap pointer is wrong");

const sitemap = read("sitemap.xml");
const pageSitemap = read("sitemap-0.xml");
if (!sitemap.includes(`${origin}/sitemap-0.xml`)) fail("sitemap.xml does not point at sitemap-0.xml");
const locs = [...pageSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (!locs.includes(canonical)) fail(`sitemap pages are ${locs.join(", ")}`);
if (locs.some((loc) => loc !== canonical && loc.replace(/\/$/, "") === origin)) {
  fail("sitemap has duplicate trailing-slash homepage variants");
}
if (locs.some((loc) => loc.includes("feed.xml"))) fail("sitemap includes the RSS feed");

const cname = read("CNAME").trim();
if (cname !== "devradio.co.uk") fail(`CNAME is ${JSON.stringify(cname)}`);

const og = pngSize("og/devradio-og.png");
if (og.width !== 1200 || og.height !== 630) fail(`OG image is ${og.width}x${og.height}`);
if (og.bytes > 300 * 1024) fail(`OG image is ${og.bytes} bytes`);

const favicon = pngSize("favicon-32.png");
if (favicon.width !== 32 || favicon.height !== 32) fail("favicon-32.png is not 32x32");
const apple = pngSize("apple-touch-icon.png");
if (apple.width !== 180 || apple.height !== 180) fail("apple-touch-icon.png is not 180x180");

const manifest = JSON.parse(read("site.webmanifest") || "{}");
for (const key of ["name", "short_name", "background_color", "theme_color", "icons"]) {
  if (!manifest[key]) fail(`manifest missing ${key}`);
}
if (manifest.theme_color !== "#1a1b26" || manifest.background_color !== "#1a1b26") {
  fail("manifest colours are not Tokyo Night");
}

if (failures.length) {
  console.error(failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`SEO check passed
title: ${title} (${title.length})
description: ${description} (${description.length})
canonical: ${canonical}
og:image: ${origin}/og/devradio-og.png (${og.width}x${og.height}, ${og.bytes} bytes)
json-ld: ${graph.map((node) => node["@type"]).join(", ")}`);
