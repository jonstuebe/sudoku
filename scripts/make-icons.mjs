// Renders the PWA icons from the wordmark's 3×3 box. Usage: npm run icons
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const outDir = new URL('../public/icons/', import.meta.url);
await mkdir(outDir, { recursive: true });

const INK = '#1C2541';
const ACCENT = '#A593FF';

/**
 * @param {number} radius corner rounding; 0 for full-bleed (maskable and iOS add their own mask)
 * @param {number} scale artwork scale; maskable icons keep their art inside the central 80%
 */
const icon = (radius, scale) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${radius}" fill="${INK}"/>
  <g transform="translate(256 256) scale(${scale * 15}) translate(-12 -12)"
     fill="none" stroke="${ACCENT}" stroke-width="1.6" stroke-linecap="round">
    <rect x="3" y="3" width="18" height="18" rx="3"/>
    <path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
    <rect x="9" y="9" width="6" height="6" fill="${ACCENT}" stroke="none"/>
  </g>
</svg>`;

const targets = [
  { file: 'icon-192.png', size: 192, svg: icon(96, 1) },
  { file: 'icon-512.png', size: 512, svg: icon(96, 1) },
  { file: 'icon-maskable-512.png', size: 512, svg: icon(0, 0.78) },
  { file: 'apple-touch-icon.png', size: 180, svg: icon(0, 1) },
];

for (const { file, size, svg } of targets) {
  const png = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  await writeFile(new URL(file, outDir), png);
  console.log('wrote', file, `${size}×${size}`);
}
