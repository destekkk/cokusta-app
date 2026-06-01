import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadEnvFiles() {
  for (const file of [".env.local", ".env"]) {
    const path = join(process.cwd(), file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      if (process.env[key]) continue;
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

function run(cmd, { allowFail = false } = {}) {
  try {
    execSync(cmd, { stdio: "inherit", env: process.env });
    return true;
  } catch {
    if (allowFail) return false;
    process.exit(1);
  }
}

loadEnvFiles();

// Neon: DIRECT_URL yoksa pooler URL'den türet (Vercel'de sadece DATABASE_URL tanımlı olabilir)
if (!process.env.DIRECT_URL?.trim() && process.env.DATABASE_URL?.trim()) {
  process.env.DIRECT_URL = process.env.DATABASE_URL.replace("-pooler", "");
  console.log("[vercel-build] DIRECT_URL yok — DATABASE_URL'den türetildi.");
}

run("npx prisma generate");

const pushed = run("npx prisma db push --skip-generate", { allowFail: true });
if (!pushed) {
  console.warn(
    "[vercel-build] prisma db push başarısız — build devam ediyor. Ana sayfa DB yedekleriyle açılır; şemayı Neon'da elle senkronlayın."
  );
}

run("npx next build");
