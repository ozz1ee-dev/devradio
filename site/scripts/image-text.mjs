import { inflateSync } from "node:zlib";

const BG = [0x1a, 0x1b, 0x26];
const TITLE = [0xc0, 0xca, 0xf5];
const ACCENT = [0x7a, 0xa2, 0xf7];

export function decodePng(buffer) {
  const png = Buffer.from(buffer);
  if (png.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error("not a PNG");
  }
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];
  while (offset + 8 <= png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString("ascii", offset + 4, offset + 8);
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      if (data[10] !== 0) throw new Error("interlaced PNG is not supported");
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(`unsupported PNG color type ${colorType}`);
  }
  const channels = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const pixels = Buffer.alloc(width * height * 4);
  let src = 0;
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[src++];
    const row = Buffer.from(raw.subarray(src, src + stride));
    src += stride;
    for (let i = 0; i < stride; i++) {
      const left = i >= channels ? row[i - channels] : 0;
      const up = prev[i];
      const ul = i >= channels ? prev[i - channels] : 0;
      let add = 0;
      if (filter === 0) add = 0;
      else if (filter === 1) add = left;
      else if (filter === 2) add = up;
      else if (filter === 3) add = (left + up) >> 1;
      else if (filter === 4) {
        const p = left + up - ul;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - ul);
        add = pa <= pb && pa <= pc ? left : pb <= pc ? up : ul;
      } else {
        throw new Error(`unsupported PNG filter ${filter}`);
      }
      row[i] = (row[i] + add) & 255;
    }
    prev = row;
    for (let x = 0; x < width; x++) {
      const si = x * channels;
      const di = (y * width + x) * 4;
      pixels[di] = row[si];
      pixels[di + 1] = row[si + 1];
      pixels[di + 2] = row[si + 2];
      pixels[di + 3] = channels === 4 ? row[si + 3] : 255;
    }
  }
  return { width, height, pixels };
}

function near(r, g, b, target, tolerance) {
  return Math.abs(r - target[0]) <= tolerance && Math.abs(g - target[1]) <= tolerance && Math.abs(b - target[2]) <= tolerance;
}

function countNear(image, box, target, tolerance) {
  const { width, pixels } = image;
  const x0 = Math.max(0, box.x);
  const y0 = Math.max(0, box.y);
  const x1 = Math.min(width, box.x + box.width);
  const y1 = Math.min(image.height, box.y + box.height);
  let count = 0;
  let sum = 0;
  let sum2 = 0;
  let n = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      sum += lum;
      sum2 += lum * lum;
      n++;
      if (near(r, g, b, target, tolerance)) count++;
    }
  }
  const mean = n ? sum / n : 0;
  const variance = n ? sum2 / n - mean * mean : 0;
  return { count, variance, n };
}

/** Fail when the title, tagline, or alpha badge did not rasterise. */
export function assertOgImage(buffer) {
  const image = decodePng(buffer);
  if (image.width !== 1200 || image.height !== 630) {
    throw new Error(`OG image is ${image.width}x${image.height}, expected 1200x630`);
  }
  if (buffer.length > 300 * 1024) {
    throw new Error(`OG image is ${buffer.length} bytes; limit is 300 KB`);
  }
  const title = countNear(image, { x: 96, y: 230, width: 760, height: 120 }, TITLE, 36);
  const tagline = countNear(image, { x: 96, y: 390, width: 980, height: 90 }, TITLE, 36);
  const badge = countNear(image, { x: 112, y: 108, width: 100, height: 26 }, ACCENT, 28);
  const problems = [];
  if (title.variance < 80 || title.count < 2500) {
    problems.push(`title region is empty (variance ${title.variance.toFixed(1)}, ink ${title.count})`);
  }
  if (tagline.variance < 40 || tagline.count < 1200) {
    problems.push(`tagline region is empty (variance ${tagline.variance.toFixed(1)}, ink ${tagline.count})`);
  }
  if (badge.count < 40) {
    problems.push(`alpha badge has no lettering (ink ${badge.count})`);
  }
  if (problems.length) {
    throw new Error(problems.join("; "));
  }
  return { title, tagline, badge };
}

/** Favicon art is the waveform mark on the Tokyo Night ground, with no lettering. */
export function assertIcon(buffer, label, size) {
  const image = decodePng(buffer);
  if (image.width !== size || image.height !== size) {
    throw new Error(`${label} is ${image.width}x${image.height}, expected ${size}x${size}`);
  }
  const ground = countNear(image, { x: 0, y: 0, width: size, height: size }, BG, 8);
  const bars = countNear(image, { x: 0, y: 0, width: size, height: size }, ACCENT, 24);
  if (ground.count < size * size * 0.4) {
    throw new Error(`${label} is missing its dark ground (${ground.count} px)`);
  }
  if (bars.count < Math.max(8, size * 0.04)) {
    throw new Error(`${label} is missing the waveform mark (${bars.count} px)`);
  }
  return { ground: ground.count, bars: bars.count };
}
