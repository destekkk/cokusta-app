import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

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

await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, "cokusta-logo.svg"), horizontalLogoSvg(1000, 380), "utf8");
await writeFile(path.join(outDir, "cokusta-favicon.svg"), faviconSvg(1000), "utf8");
console.log("SVG dosyaları oluşturuldu.");
