import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const source = process.argv[2];
if (!source) {
  console.error("Kaynak PNG gerekli.");
  process.exit(1);
}

const cropOptions = { fit: "cover", position: "centre" };

await sharp(source)
  .resize(32, 32, cropOptions)
  .png()
  .toFile(path.join(root, "app", "icon.png"));

await sharp(source)
  .resize(180, 180, cropOptions)
  .png()
  .toFile(path.join(root, "app", "apple-icon.png"));

console.log("app/icon.png ve app/apple-icon.png oluşturuldu.");
