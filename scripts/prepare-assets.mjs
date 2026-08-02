/**
 * One-off asset pipeline: downscales the campaign photos to the largest size the
 * layout can actually paint, strips EXIF, and renders the social card.
 *
 * Sources live in "Fotos Biancardine 2026/" (not deployed). Output goes to
 * assets/, which the app imports statically so next/image gets intrinsic
 * dimensions and a blur placeholder for free.
 *
 *   node scripts/prepare-assets.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const photos = path.join(root, 'Fotos Biancardine 2026');
const out = path.join(root, 'assets');

/** Matched to the design's source photos by EXIF (camera + capture timestamp). */
const IMAGES = [
  { src: 'IMG_6672.JPG', name: 'hero-palco', width: 1400 },
  { src: 'Renova br/MMZ07112.jpeg', name: 'grupo', width: 1800 },
  { src: 'MATHEUS 121.jpeg', name: 'retrato-novo', width: 1200 },
  { src: '@dianematosfotografa29.jpeg', name: 'fala-microfone', width: 900 },
  { src: 'Renova br/ANM_8387.jpeg', name: 'evento1', width: 1100 },
  { src: 'Renova br/R6A_6354.jpeg', name: 'evento2', width: 1100 },
  { src: 'DSC_1792.jpeg', name: 'bh-predio', width: 1400 },
];

await mkdir(out, { recursive: true });

let total = 0;
for (const { src, name, width } of IMAGES) {
  const dest = path.join(out, `${name}.jpg`);
  const info = await sharp(path.join(photos, src))
    .rotate() // bake in EXIF orientation before metadata is dropped
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: '4:2:0' })
    .toFile(dest);
  total += info.size;
  console.log(`${name.padEnd(16)} ${String(info.width).padStart(4)}x${String(info.height).padEnd(4)}  ${(info.size / 1024).toFixed(0)} KB`);
}
console.log(`${''.padEnd(16)} total ${(total / 1024).toFixed(0)} KB`);

// --- Decorative textures ----------------------------------------------------
// These four layers sit at 8–20% opacity behind a gradient. They carry no
// information, so they skip next/image entirely: a single small file per format
// referenced from CSS image-set() means no responsive srcset, no optimizer
// round-trip, and no client JS — just an immutable CDN asset.
const TEXTURES = [
  { src: 'Renova br/MMZ07112.jpeg', name: 'grupo' },
  { src: 'FT_06483.jpeg', name: 'manifesto' },
];

await mkdir(path.join(root, 'public', 'textures'), { recursive: true });

for (const { src, name } of TEXTURES) {
  // 960px and heavy compression: at 8–20% opacity behind a gradient there is
  // nothing left to resolve, and the donation strip's copy sits above the fold.
  const base = sharp(path.join(photos, src)).rotate().resize({ width: 960 });
  const avif = await base
    .clone()
    .avif({ quality: 28, effort: 9 })
    .toFile(path.join(root, 'public', 'textures', `${name}.avif`));
  const jpg = await base
    .clone()
    .jpeg({ quality: 40, mozjpeg: true })
    .toFile(path.join(root, 'public', 'textures', `${name}.jpg`));
  console.log(
    `textures/${name.padEnd(10)} avif ${(avif.size / 1024).toFixed(0)} KB · jpg ${(jpg.size / 1024).toFixed(0)} KB`,
  );
}

// --- Social card ------------------------------------------------------------
// 1200x630, subject on the right, headline on the left. Text is drawn as SVG so
// the card stays legible when Facebook/WhatsApp re-compress it.
const OG_W = 1200;
const OG_H = 630;

const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#011E2B" stop-opacity="0.98"/>
      <stop offset="52%"  stop-color="#012E40" stop-opacity="0.92"/>
      <stop offset="100%" stop-color="#012E40" stop-opacity="0.25"/>
    </linearGradient>
  </defs>
  <rect width="${OG_W}" height="${OG_H}" fill="url(#scrim)"/>
  <rect x="0" y="${OG_H - 10}" width="${OG_W}" height="10" fill="#29EA28"/>
  <text x="72" y="150" font-family="Helvetica, Arial, sans-serif" font-size="21" font-weight="700" letter-spacing="5" fill="#29EA28">DEPUTADO FEDERAL &#183; MG</text>
  <text x="72" y="238" font-family="Helvetica, Arial, sans-serif" font-size="66" font-style="italic" font-weight="bold" fill="#FFFFFF">MATHEUS</text>
  <text x="72" y="308" font-family="Helvetica, Arial, sans-serif" font-size="66" font-style="italic" font-weight="bold" fill="#29EA28">BIANCARDINE</text>
  <text x="72" y="396" font-family="Helvetica, Arial, sans-serif" font-size="33" font-weight="600" fill="#C7E3EC">O primeiro passo foi dado. Agora, a</text>
  <text x="72" y="440" font-family="Helvetica, Arial, sans-serif" font-size="33" font-weight="600" fill="#C7E3EC">nossa miss&#227;o precisa da sua voz.</text>
  <rect x="72" y="492" width="416" height="62" rx="12" fill="#29EA28"/>
  <text x="280" y="533" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="24" font-weight="bold" fill="#012E40">QUERO SER UM APOIADOR</text>
</svg>`);

const ogInfo = await sharp(path.join(photos, 'IMG_6672.JPG'))
  .rotate()
  // Scale to card width, then take a fixed window: auto-cropping puts his face
  // on the bottom edge, and 'attention' lands on the microphone.
  .resize({ width: OG_W })
  .extract({ left: 0, top: 250, width: OG_W, height: OG_H })
  .composite([{ input: overlay }])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(path.join(root, 'public', 'og.jpg'));
console.log(`og.jpg           ${ogInfo.width}x${ogInfo.height}  ${(ogInfo.size / 1024).toFixed(0)} KB`);
