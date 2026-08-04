/**
 * Asset pipeline for the section artwork.
 *
 * assets/fundos/ holds the delivered art boards. BLOCO1/2/5 are photographic
 * compositions used as full-bleed section backdrops, each with a landscape
 * desktop board (1920x1080) and a portrait mobile cut (600x899). BLOCO3/4/6 are
 * flat gradients and are rebuilt in CSS rather than shipped as pixels.
 *
 * Output lands in public/art/ as AVIF + WebP + JPEG so the markup can use a
 * plain <picture>: art-directed at 768px, exactly one file downloaded, served
 * straight from the CDN with no image-optimizer round-trip.
 *
 *   node scripts/prepare-assets.mjs
 */
import { mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fundos = path.join(root, 'assets', 'fundos');
const out = path.join(root, 'public', 'art');

/** Only the three boards that carry photography. */
const BLOCKS = [
  { n: 1, name: 'doacao' },
  { n: 2, name: 'hero' },
  { n: 5, name: 'manifesto' },
];

const VARIANTS = [
  // Desktop board covers a 1440 layout; 1920 is the native width.
  { key: 'desktop', file: (n) => `matheus-biancardini-landing-pageBLOCO${n}.png`, width: 1920 },
  // Portrait cut is only 600px wide at source — see the note in the README.
  { key: 'mobile', file: (n) => `matheus-biancardini-landingpage-mobilestxtBLOCO${n}m.png`, width: 600 },
];

await mkdir(out, { recursive: true });

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
let total = 0;

for (const { n, name } of BLOCKS) {
  for (const variant of VARIANTS) {
    const source = sharp(path.join(fundos, variant.file(n))).resize({
      width: variant.width,
      withoutEnlargement: true,
    });
    const base = path.join(out, `${name}-${variant.key}`);

    const avif = await source.clone().avif({ quality: 52, effort: 7 }).toFile(`${base}.avif`);
    const webp = await source.clone().webp({ quality: 76 }).toFile(`${base}.webp`);
    const jpg = await source
      .clone()
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(`${base}.jpg`);

    total += avif.size;
    console.log(
      `${`${name}-${variant.key}`.padEnd(20)} ${avif.width}x${avif.height}  ` +
        `avif ${kb(avif.size).padStart(7)} · webp ${kb(webp.size).padStart(7)} · jpg ${kb(jpg.size).padStart(7)}`,
    );
  }
}
console.log(`${''.padEnd(20)} AVIF total (what most browsers download): ${kb(total)}`);

// --- Social card ------------------------------------------------------------
// The donation board already carries the logo and the three faces, so the card
// matches what people see the moment they land.
const OG_W = 1200;
const OG_H = 630;

const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="50%" stop-color="#001E37" stop-opacity="0"/>
      <stop offset="88%" stop-color="#001E37" stop-opacity="0.96"/>
    </linearGradient>
  </defs>
  <rect width="${OG_W}" height="${OG_H}" fill="url(#fade)"/>
  <text x="600" y="524" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="41" font-weight="bold" fill="#00DF00">A NOSSA CAMPANHA É FEITA POR PESSOAS DE BEM,</text>
  <text x="600" y="572" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="41" font-weight="bold" fill="#FFFFFF">SEM USAR FUNDÃO BILIONÁRIO.</text>
</svg>`);

const og = await sharp(path.join(fundos, 'matheus-biancardini-landing-pageBLOCO1.png'))
  .resize({ width: OG_W, height: OG_H, fit: 'cover', position: 'top' })
  .composite([{ input: overlay }])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(path.join(root, 'public', 'og.jpg'));
console.log(`og.jpg               ${og.width}x${og.height}  ${kb(og.size)}`);

const shipped = await readdir(out);
console.log(`\npublic/art: ${shipped.length} files`);
