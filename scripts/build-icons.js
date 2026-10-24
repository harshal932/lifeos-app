import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Professional SVG icon design matching specifications:
// - Minimal, premium productivity-app identity
// - Dark navy background with emerald green accents
// - A clean white checkmark combined with a subtle circular progress symbol
// - Rounded-square composition, visually balanced and recognizable at small sizes
// - No text, no watermark
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Dark Navy Gradient Background -->
    <linearGradient id="navyBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f192c" />
      <stop offset="50%" stop-color="#090d18" />
      <stop offset="100%" stop-color="#04060b" />
    </linearGradient>

    <!-- Emerald Glow Ring Gradient -->
    <linearGradient id="emeraldRing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="60%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>

    <!-- Subtle Outer Glow -->
    <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <filter id="checkShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Rounded-square Dark Navy Background with Subtle Inset Border -->
  <rect width="512" height="512" rx="118" fill="url(#navyBg)" />
  <rect width="506" height="506" x="3" y="3" rx="115" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="3" />

  <!-- Background Progress Track Ring (Subtle Track) -->
  <circle
    cx="256"
    cy="256"
    r="162"
    fill="none"
    stroke="rgba(16, 185, 129, 0.12)"
    stroke-width="30"
  />

  <!-- Emerald Green Circular Progress Ring Accent (Glow Layer) -->
  <circle
    cx="256"
    cy="256"
    r="162"
    fill="none"
    stroke="url(#emeraldRing)"
    stroke-width="30"
    stroke-dasharray="1018"
    stroke-dashoffset="240"
    stroke-linecap="round"
    transform="rotate(-90 256 256)"
    opacity="0.6"
    filter="url(#ringGlow)"
  />

  <!-- Emerald Green Circular Progress Ring Accent (Core Sharp Layer) -->
  <circle
    cx="256"
    cy="256"
    r="162"
    fill="none"
    stroke="url(#emeraldRing)"
    stroke-width="30"
    stroke-dasharray="1018"
    stroke-dashoffset="240"
    stroke-linecap="round"
    transform="rotate(-90 256 256)"
  />

  <!-- Clean Bold White Checkmark in Center -->
  <path
    d="M 194 262 L 236 308 L 322 196"
    fill="none"
    stroke="#ffffff"
    stroke-width="38"
    stroke-linecap="round"
    stroke-linejoin="round"
    filter="url(#checkShadow)"
  />
</svg>`;

async function generateIcons() {
  const iconsDir = path.resolve('public/icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Save SVG
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), iconSvg);

  const svgBuffer = Buffer.from(iconSvg);

  // Generate 512x512 PNG
  await sharp(svgBuffer)
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(iconsDir, 'icon-512.png'));
  console.log('✓ Generated public/icons/icon-512.png (512x512)');

  // Generate 192x192 PNG
  await sharp(svgBuffer)
    .resize(192, 192)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(iconsDir, 'icon-192.png'));
  console.log('✓ Generated public/icons/icon-192.png (192x192)');

  // Generate 180x180 Apple touch icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(path.resolve('public/apple-touch-icon.png'));
  console.log('✓ Generated public/apple-touch-icon.png (180x180)');

  // Generate 48x48 / favicon.ico
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.resolve('public/favicon.ico'));
  console.log('✓ Generated public/favicon.ico (48x48)');
}

generateIcons().catch(console.error);
