import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { assertIcon, assertOgImage } from "./image-text.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fontFiles = [
  resolve(root, "brand/fonts/Geist-Variable.ttf"),
  resolve(root, "brand/fonts/JetBrainsMono-Medium.ttf"),
].map((file) => {
  if (!existsSync(file)) throw new Error(`Missing bundled font ${file}`);
  return file;
});

const font = {
  fontFiles,
  loadSystemFonts: false,
  defaultFontFamily: "Geist",
  sansSerifFamily: "Geist",
  monospaceFamily: "JetBrains Mono",
};

function render(svg, width) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font,
    background: "#1a1b26",
    shapeRendering: 2,
    textRendering: 1,
    imageRendering: 0,
    logLevel: "warn",
  });
  return resvg.render().asPng();
}

function writePng(relativePath, png) {
  const path = resolve(root, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, png);
  return path;
}

const ogPng = render(readFileSync(resolve(root, "brand/devradio-og.svg")), 1200);
const ogStats = assertOgImage(ogPng);
const ogPath = writePng("public/og/devradio-og.png", ogPng);

const iconSvg = readFileSync(resolve(root, "public/favicon.svg"));
const favicon = render(iconSvg, 32);
const apple = render(iconSvg, 180);
assertIcon(favicon, "favicon-32.png", 32);
assertIcon(apple, "apple-touch-icon.png", 180);
writePng("public/favicon-32.png", favicon);
writePng("public/apple-touch-icon.png", apple);

console.log(
  `OG image ${ogPng.length} bytes → ${ogPath} (title ink ${ogStats.title.count}, tagline ink ${ogStats.tagline.count}, badge ink ${ogStats.badge.count})`,
);
