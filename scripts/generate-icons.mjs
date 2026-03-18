/**
 * PWA Icon Generator
 * Generates all required PNG icons from the source SVG
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

// App icon SVG optimized for PWA
const appIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="96" fill="#1E1B4B"/>
  <rect x="32" y="32" width="448" height="448" rx="80" fill="#0F0D1A"/>
  <path d="M256 96L128 160v96c0 88.8 54.4 171.84 128 192 73.6-20.16 128-103.2 128-192v-96l-128-64z" fill="#6366F1" opacity="0.2"/>
  <path d="M256 96L128 160v96c0 88.8 54.4 171.84 128 192 73.6-20.16 128-103.2 128-192v-96l-128-64z" stroke="#6366F1" stroke-width="16" fill="none"/>
  <path d="M192 256l48 48 80-96" stroke="#6366F1" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Maskable icon with safe zone (icon inside 80% safe area)
const maskableIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="#1E1B4B"/>
  <rect x="51" y="51" width="410" height="410" rx="80" fill="#0F0D1A"/>
  <path d="M256 128L160 176v72c0 66.6 40.8 128.88 96 144 55.2-15.12 96-77.4 96-144v-72l-96-48z" fill="#6366F1" opacity="0.2"/>
  <path d="M256 128L160 176v72c0 66.6 40.8 128.88 96 144 55.2-15.12 96-77.4 96-144v-72l-96-48z" stroke="#6366F1" stroke-width="12" fill="none"/>
  <path d="M216 248l36 36 60-72" stroke="#6366F1" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Apple touch icon (rounded corners handled by iOS)
const appleTouchSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" fill="none">
  <rect width="180" height="180" fill="#1E1B4B"/>
  <rect x="10" y="10" width="160" height="160" rx="30" fill="#0F0D1A"/>
  <path d="M90 38L50 58v36c0 31.08 18.98 60.14 40 67.2 21.02-7.06 40-36.12 40-67.2V58l-40-20z" fill="#6366F1" opacity="0.2"/>
  <path d="M90 38L50 58v36c0 31.08 18.98 60.14 40 67.2 21.02-7.06 40-36.12 40-67.2V58l-40-20z" stroke="#6366F1" stroke-width="5" fill="none"/>
  <path d="M70 94l18 18 30-36" stroke="#6366F1" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// OG Image (1200x630)
const ogImageSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" fill="none">
  <rect width="1200" height="630" fill="#0F0D1A"/>
  <rect x="40" y="40" width="1120" height="550" rx="24" fill="#1E1B4B" opacity="0.3"/>

  <!-- Icon -->
  <g transform="translate(100, 165)">
    <rect width="300" height="300" rx="60" fill="#1E1B4B"/>
    <rect x="20" y="20" width="260" height="260" rx="50" fill="#0F0D1A"/>
    <path d="M150 60L80 92v56c0 52 31.9 100.6 70 112 38.1-11.4 70-60 70-112V92l-70-32z" fill="#6366F1" opacity="0.2"/>
    <path d="M150 60L80 92v56c0 52 31.9 100.6 70 112 38.1-11.4 70-60 70-112V92l-70-32z" stroke="#6366F1" stroke-width="10" fill="none"/>
    <path d="M115 159l28 28 47-56" stroke="#6366F1" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Text -->
  <text x="460" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="700" fill="#F8FAFC">Bill Vault</text>
  <text x="460" y="360" font-family="system-ui, -apple-system, sans-serif" font-size="32" fill="#94A3B8">Never Lose a Warranty Again</text>
  <text x="460" y="420" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#64748B">Track bills, warranties &amp; get expiry alerts</text>
</svg>`;

// Favicon for consistency (update to match app colors)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="8" fill="#1E1B4B"/>
  <path d="M16 6L8 10v6c0 5.55 3.4 10.74 8 12 4.6-1.26 8-6.45 8-12v-6l-8-4z" fill="#6366F1" opacity="0.2"/>
  <path d="M16 6L8 10v6c0 5.55 3.4 10.74 8 12 4.6-1.26 8-6.45 8-12v-6l-8-4z" stroke="#6366F1" stroke-width="1.5" fill="none"/>
  <path d="M12 16l3 3 5-6" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const icons = [
  { name: 'icon-192x192.png', svg: appIconSvg, size: 192 },
  { name: 'icon-512x512.png', svg: appIconSvg, size: 512 },
  { name: 'apple-touch-icon.png', svg: appleTouchSvg, size: 180 },
  { name: 'icon-maskable-512x512.png', svg: maskableIconSvg, size: 512 },
  { name: 'icon-maskable-192x192.png', svg: maskableIconSvg, size: 192 },
];

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  // Ensure icons directory exists
  await fs.mkdir(iconsDir, { recursive: true });

  // Generate PNG icons
  for (const icon of icons) {
    const outputPath = path.join(iconsDir, icon.name);
    await sharp(Buffer.from(icon.svg))
      .resize(icon.size, icon.size)
      .png()
      .toFile(outputPath);
    console.log(`✅ Generated: icons/${icon.name} (${icon.size}x${icon.size})`);
  }

  // Generate OG image
  const ogPath = path.join(publicDir, 'og-image.png');
  await sharp(Buffer.from(ogImageSvg))
    .resize(1200, 630)
    .png()
    .toFile(ogPath);
  console.log('✅ Generated: og-image.png (1200x630)');

  // Update favicon for consistency
  const faviconPath = path.join(publicDir, 'favicon.svg');
  await fs.writeFile(faviconPath, faviconSvg.trim());
  console.log('✅ Updated: favicon.svg');

  // Update icon.svg
  const iconSvgPath = path.join(iconsDir, 'icon.svg');
  await fs.writeFile(iconSvgPath, appIconSvg.trim());
  console.log('✅ Updated: icons/icon.svg');

  console.log('\n🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);
