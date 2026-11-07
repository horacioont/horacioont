/**
 * Genera fotos de ejemplo (placeholders) para las propiedades demo.
 * Uso: npm run placeholders
 * Reemplázalas con fotografías reales desde /admin o copiándolas a la carpeta de cada propiedad.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const W = 1600, H = 1067;
const escenas = ['Fachada', 'Sala', 'Cocina', 'Recámara principal', 'Baño', 'Jardín'];
const paletas = [
  ['#1f3a5f', '#e8d5b7', '#f6efe4'], ['#2d4a3e', '#d9c6a5', '#f3eee3'], ['#4a3f35', '#c9a77c', '#f5ede0'],
  ['#203040', '#9bb4c9', '#eef3f7'], ['#3b2f4a', '#d6b8a8', '#f7efe9'], ['#2b3a2f', '#b8c9a3', '#f1f4ea'],
];

const svg = (escena, [dark, mid, light], i) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${mid}"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#sky)"/>
  <rect y="${H * 0.68}" width="100%" height="${H * 0.32}" fill="url(#floor)" opacity=".85"/>
  <g transform="translate(${W / 2 - 340 + (i % 3) * 40},${H * 0.22})" fill="${dark}" opacity=".88">
    <polygon points="0,220 340,0 680,220"/>
    <rect x="60" y="210" width="560" height="300"/>
    <rect x="130" y="270" width="110" height="90" fill="${light}" opacity=".9"/>
    <rect x="440" y="270" width="110" height="90" fill="${light}" opacity=".9"/>
    <rect x="290" y="330" width="100" height="180" fill="${mid}"/>
  </g>
  <rect x="48" y="${H - 132}" width="${W - 96}" height="84" rx="18" fill="#000" opacity=".35"/>
  <text x="80" y="${H - 78}" font-family="Helvetica, Arial, sans-serif" font-size="38" font-weight="700" fill="#fff">${escena}</text>
  <text x="${W - 80}" y="${H - 78}" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="#fff" text-anchor="end" opacity=".85">FOTO DE EJEMPLO</text>
</svg>`;

const slugs = process.argv.slice(2);
if (!slugs.length) { console.error('Uso: node scripts/generate-placeholders.mjs <slug> [...]'); process.exit(1); }

for (const [n, slug] of slugs.entries()) {
  const dir = `src/content/propiedades/${slug}`;
  await mkdir(dir, { recursive: true });
  for (const [i, escena] of escenas.entries()) {
    const file = `${dir}/${String(i + 1).padStart(2, '0')}.jpg`;
    await sharp(Buffer.from(svg(escena, paletas[(n + i) % paletas.length], n + i))).jpeg({ quality: 78, mozjpeg: true }).toFile(file);
  }
  console.log('✓', slug);
}
