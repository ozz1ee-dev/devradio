import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fonts = {
  fontFiles: [
    resolve(root, "src/assets/fonts/geist/Geist-Variable.woff2"),
    resolve(root, "src/assets/fonts/jetbrains-mono/JetBrainsMono-Medium.woff2"),
    resolve(root, "src/assets/fonts/jetbrains-mono/JetBrainsMono-Regular.woff2"),
  ],
  loadSystemFonts: false,
  defaultFontFamily: "Geist",
  sansSerifFamily: "Geist",
  monospaceFamily: "JetBrains Mono",
};

function render(svg, width) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: fonts,
    background: "#1a1b26",
    shapeRendering: 2,
    textRendering: 1,
    imageRendering: 0,
  });
  return resvg.render().asPng();
}

function writePng(relativePath, png) {
  const path = resolve(root, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, png);
  return path;
}

const ogSvg = readFileSync(resolve(root, "brand/devradio-og.svg"));
const ogPng = render(ogSvg, 1200);
const ogPath = writePng("public/og/devradio-og.png", ogPng);

const iconSvg = readFileSync(resolve(root, "public/favicon.svg"));
writePng("public/favicon-32.png", render(iconSvg, 32));
writePng("public/apple-touch-icon.png", render(iconSvg, 180));

if (ogPng.length > 300 * 1024) {
  throw new Error(`OG image is ${ogPng.length} bytes; limit is 300 KB`);
}

console.log(`OG image ${ogPng.length} bytes → ${ogPath}`);
