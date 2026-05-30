#!/usr/bin/env bash
# Çokusta — Linux + Plesk sunucuda ilk kurulum
# Kullanım: chmod +x scripts/setup-production.sh && ./scripts/setup-production.sh

set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Node sürümü"
node -v
npm -v

if [ ! -f .env ]; then
  echo "HATA: .env dosyası yok. Önce .env.example dosyasını kopyalayıp doldurun."
  exit 1
fi

if ! grep -q '^DATABASE_URL=mysql://' .env; then
  echo "HATA: .env içinde DATABASE_URL tanımlı değil."
  exit 1
fi

echo "==> Bağımlılıklar"
npm install

echo "==> Prisma client + tablolar"
npm run deploy:setup

if [ "${SEED:-0}" = "1" ]; then
  echo "==> Mevcut JSON verisi aktarılıyor"
  npm run db:seed
fi

echo "==> Production build"
npm run build

echo "==> PM2 ile başlat"
if command -v pm2 >/dev/null 2>&1; then
  pm2 delete cokusta 2>/dev/null || true
  pm2 start ecosystem.config.cjs
  pm2 save
  echo "Site http://127.0.0.1:3000 adresinde çalışıyor."
  echo "Plesk/Nginx reverse proxy ile cokusta.com -> :3000 yönlendirin."
else
  echo "PM2 yok. Kur: sudo npm install -g pm2"
  echo "Manuel başlat: npm start"
fi
