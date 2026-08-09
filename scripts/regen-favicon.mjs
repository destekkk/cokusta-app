import sharp from "sharp";
import { readFileSync } from "fs";

const svg = readFileSync("public/images/brand/cokusta-favicon.svg");

await sharp(svg).resize(32, 32).png().toFile("app/icon.png");
await sharp(svg).resize(48, 48).png().toFile("public/favicon-v3.png");
await sharp(svg).resize(32, 32).png().toFile("public/favicon.ico");
await sharp(svg).resize(180, 180).png().toFile("app/apple-icon.png");
await sharp(svg).resize(512, 512).png().toFile("public/images/brand/cokusta-favicon-512.png");
await sharp(svg).resize(1000, 1000).png().toFile("public/images/brand/cokusta-favicon-1000.png");

console.log("favicon regenerated");
