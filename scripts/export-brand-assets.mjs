import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import { mkdir } from "fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "images", "brand");

const COLORS = {
  secondary: "#1d4d3c",
  primary: "#00A650",
  white: "#ffffff",
};

function horizontalLogoSvg(width, height) {
  const radius = Math.round(height * 0.12);
  const fontSize = Math.round(height * 0.42);
  const half = width / 2;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${half}" height="${height}" rx="${radius}" fill="${COLORS.secondary}"/>
  <rect x="${half}" y="0" width="${half}" height="${height}" rx="${radius}" fill="${COLORS.primary}"/>
  <rect x="${half - radius}" y="0" width="${radius * 2}" height="${height}" fill="${COLORS.secondary}"/>
  <rect x="${half}" y="0" width="${radius}" height="${height}" fill="${COLORS.primary}"/>
  <text x="${half * 0.5}" y="${height * 0.62}" text-anchor="middle"
    font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700"
    fill="${COLORS.white}" letter-spacing="0.04em">çok</text>
  <text x="${half * 1.5}" y="${height * 0.62}" text-anchor="middle"
    font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700"
    fill="${COLORS.white}" letter-spacing="0.04em">usta</text>
</svg>`;
}

function faviconSvg(size) {
  const radius = Math.round(size * 0.14);
  const half = size / 2;
  const fontSize = Math.round(size * 0.22);

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" fill="${COLORS.primary}"/>
  <rect x="0" y="0" width="${size}" height="${half}" rx="${radius}" fill="${COLORS.secondary}"/>
  <rect x="0" y="${half - radius}" width="${size}" height="${radius * 2}" fill="${COLORS.secondary}"/>
  <text x="${size * 0.5}" y="${half * 0.58}" text-anchor="middle"
    font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700"
    fill="${COLORS.white}" letter-spacing="0.03em">cok</text>
  <text x="${size * 0.5}" y="${half + half * 0.58}" text-anchor="middle"
    font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700"
    fill="${COLORS.white}" letter-spacing="0.03em">usta</text>
</svg>`;
}

function profileLogoSvg(size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = Math.round(size * 0.34);
  const fontSize = Math.round(size * 0.11);
  const bgLeft = "#c8d9cf";
  const bgRight = "#d6ebe0";

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="circleClip">
      <circle cx="${cx}" cy="${cy}" r="${r}"/>
    </clipPath>
  </defs>
  <rect width="${size}" height="${size}" fill="${bgLeft}"/>
  <rect x="${cx}" width="${cx}" height="${size}" fill="${bgRight}"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${COLORS.primary}"/>
  <rect x="${cx - r}" y="${cy - r}" width="${r}" height="${r * 2}" fill="${COLORS.secondary}"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${COLORS.white}" stroke-opacity="0.08" stroke-width="2"/>
  <line x1="${cx}" y1="${cy - r}" x2="${cx}" y2="${cy + r}" stroke="${COLORS.white}" stroke-opacity="0.12" stroke-width="2"/>
  <text x="${cx - r * 0.95}" y="${cy + fontSize * 0.35}" text-anchor="middle"
    font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700"
    fill="${COLORS.white}" letter-spacing="0.02em">çok</text>
  <text x="${cx + r * 0.95}" y="${cy + fontSize * 0.35}" text-anchor="middle"
    font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700"
    fill="${COLORS.white}" letter-spacing="0.02em">usta</text>
</svg>`;
}

function profileAvatarSvg(size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = Math.round(size * 0.38);
  const fontSize = Math.round(size * 0.13);

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${COLORS.primary}"/>
  <rect x="0" y="0" width="${cx}" height="${size}" fill="${COLORS.secondary}"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${COLORS.primary}"/>
  <rect x="${cx - r}" y="${cy - r}" width="${r}" height="${r * 2}" fill="${COLORS.secondary}"/>
  <text x="${cx - r * 0.72}" y="${cy + fontSize * 0.32}" text-anchor="middle"
    font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700"
    fill="${COLORS.white}">çok</text>
  <text x="${cx + r * 0.72}" y="${cy + fontSize * 0.32}" text-anchor="middle"
    font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700"
    fill="${COLORS.white}">usta</text>
</svg>`;
}

function profileLogoLightSvg(size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = Math.round(size * 0.36);
  const fontSize = Math.round(size * 0.115);
  const bg = "#f7fbf9";
  const bgAccent = "#eef7f2";
  const circleLeft = "#b8dcc8";
  const circleRight = "#9fd4b8";
  const textLeft = "#1a4a38";
  const textRight = "#007a42";
  const ring = "#00A650";

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${bgAccent}"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${Math.round(size * 0.008)}" stdDeviation="${Math.round(size * 0.018)}" flood-color="#1d4d3c" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bgGrad)"/>
  <circle cx="${cx}" cy="${cy}" r="${r + 3}" fill="none" stroke="${ring}" stroke-opacity="0.15" stroke-width="${Math.max(2, Math.round(size * 0.006))}"/>
  <g filter="url(#softShadow)">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${circleRight}"/>
    <rect x="${cx - r}" y="${cy - r}" width="${r}" height="${r * 2}" fill="${circleLeft}"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ffffff" stroke-opacity="0.55" stroke-width="2"/>
  </g>
  <line x1="${cx}" y1="${cy - r + 4}" x2="${cx}" y2="${cy + r - 4}" stroke="#ffffff" stroke-opacity="0.45" stroke-width="1.5"/>
  <text x="${cx - r * 0.92}" y="${cy + fontSize * 0.34}" text-anchor="middle"
    font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700"
    fill="${textLeft}" letter-spacing="0.02em">çok</text>
  <text x="${cx + r * 0.92}" y="${cy + fontSize * 0.34}" text-anchor="middle"
    font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700"
    fill="${textRight}" letter-spacing="0.02em">usta</text>
</svg>`;
}

function profileLogoLightMinimalSvg(size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = Math.round(size * 0.38);
  const fontSize = Math.round(size * 0.12);

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#ffffff"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#e4f5ec"/>
  <rect x="${cx - r}" y="${cy - r}" width="${r}" height="${r * 2}" fill="#d8efe4" rx="0"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#00A650" stroke-opacity="0.25" stroke-width="3"/>
  <text x="${cx - r * 0.75}" y="${cy + fontSize * 0.32}" text-anchor="middle"
    font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700"
    fill="#1d4d3c">çok</text>
  <text x="${cx + r * 0.75}" y="${cy + fontSize * 0.32}" text-anchor="middle"
    font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700"
    fill="#00A650">usta</text>
</svg>`;
}

/** Profil dairesine tam sığan — tüm içerik daire içinde, açık renk */
function profileCompactLightSvg(size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = Math.round(size * 0.475);
  const fontSize = Math.round(size * 0.105);
  const uid = `pc${size}`;
  const bg = "#f8fcfa";
  const circleLeft = "#c5e8d4";
  const circleRight = "#a8dbbe";
  const textLeft = "#1a4a38";
  const textRight = "#007a42";

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${bg}"/>
  <defs>
    <clipPath id="${uid}">
      <circle cx="${cx}" cy="${cy}" r="${r}"/>
    </clipPath>
  </defs>
  <g clip-path="url(#${uid})">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${circleRight}"/>
    <rect x="${cx - r}" y="${cy - r}" width="${r}" height="${r * 2}" fill="${circleLeft}"/>
    <line x1="${cx}" y1="${cy - r}" x2="${cx}" y2="${cy + r}" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2"/>
    <text x="${cx - r * 0.38}" y="${cy + fontSize * 0.35}" text-anchor="middle"
      font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700"
      fill="${textLeft}">çok</text>
    <text x="${cx + r * 0.38}" y="${cy + fontSize * 0.35}" text-anchor="middle"
      font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700"
      fill="${textRight}">usta</text>
  </g>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#00A650" stroke-opacity="0.18" stroke-width="2"/>
</svg>`;
}

/** Dairesel kırpma — sadece daire, köşeler boş (en güvenli profil) */
function profileCircleOnlySvg(size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;
  const fontSize = Math.round(size * 0.11);
  const circleLeft = "#c8e9d6";
  const circleRight = "#a5d9b8";
  const textLeft = "#1d4d3c";
  const textRight = "#00884a";

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${circleRight}"/>
  <rect x="0" y="0" width="${cx}" height="${size}" fill="${circleLeft}"/>
  <line x1="${cx}" y1="0" x2="${cx}" y2="${size}" stroke="#ffffff" stroke-opacity="0.45" stroke-width="2"/>
  <text x="${cx - r * 0.36}" y="${cy + fontSize * 0.34}" text-anchor="middle"
    font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700"
    fill="${textLeft}">çok</text>
  <text x="${cx + r * 0.36}" y="${cy + fontSize * 0.34}" text-anchor="middle"
    font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700"
    fill="${textRight}">usta</text>
</svg>`;
}

async function renderSvg(svg, outputPath) {
  await sharp(Buffer.from(svg)).png().toFile(outputPath);
}

await mkdir(outDir, { recursive: true });

const logoPath = path.join(outDir, "cokusta-logo-1000.png");
const faviconPath = path.join(outDir, "cokusta-favicon-1000.png");
const favicon512Path = path.join(outDir, "cokusta-favicon-512.png");
const profile400Path = path.join(outDir, "cokusta-profil-400.png");
const profile512Path = path.join(outDir, "cokusta-profil-512.png");
const avatar180Path = path.join(outDir, "cokusta-avatar-180.png");
const profileLight400Path = path.join(outDir, "cokusta-profil-acik-400.png");
const profileLight512Path = path.join(outDir, "cokusta-profil-acik-512.png");
const profileLight1000Path = path.join(outDir, "cokusta-profil-acik-1000.png");
const profileLightMin400Path = path.join(outDir, "cokusta-profil-acik-minimal-400.png");
const profileFit400Path = path.join(outDir, "cokusta-profil-sigdir-400.png");
const profileFit512Path = path.join(outDir, "cokusta-profil-sigdir-512.png");
const profileFit1024Path = path.join(outDir, "cokusta-profil-sigdir-1024.png");
const profileCircle400Path = path.join(outDir, "cokusta-profil-daire-400.png");
const profileCircle512Path = path.join(outDir, "cokusta-profil-daire-512.png");

await renderSvg(horizontalLogoSvg(1000, 380), logoPath);
await renderSvg(faviconSvg(1000), faviconPath);
await renderSvg(faviconSvg(512), favicon512Path);
await renderSvg(profileLogoSvg(512), profile512Path);
await renderSvg(profileLogoSvg(400), profile400Path);
await renderSvg(profileAvatarSvg(180), avatar180Path);
await renderSvg(profileLogoLightSvg(400), profileLight400Path);
await renderSvg(profileLogoLightSvg(512), profileLight512Path);
await renderSvg(profileLogoLightSvg(1000), profileLight1000Path);
await renderSvg(profileLogoLightMinimalSvg(400), profileLightMin400Path);
await renderSvg(profileCompactLightSvg(400), profileFit400Path);
await renderSvg(profileCompactLightSvg(512), profileFit512Path);
await renderSvg(profileCompactLightSvg(1024), profileFit1024Path);
await renderSvg(profileCircleOnlySvg(400), profileCircle400Path);
await renderSvg(profileCircleOnlySvg(512), profileCircle512Path);

console.log("Oluşturuldu:");
console.log(" ", logoPath);
console.log(" ", faviconPath);
console.log(" ", favicon512Path);
console.log(" ", profile512Path);
console.log(" ", profile400Path);
console.log(" ", avatar180Path);
console.log(" ", profileLight400Path);
console.log(" ", profileLight512Path);
console.log(" ", profileLight1000Path);
console.log(" ", profileLightMin400Path);
console.log(" --- Profil (sığdırılmış) ---");
console.log(" ", profileFit400Path);
console.log(" ", profileFit512Path);
console.log(" ", profileFit1024Path);
console.log(" ", profileCircle400Path);
console.log(" ", profileCircle512Path);
