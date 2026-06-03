# Usta APK build + siteye kopyalama
# Gereksinim: expo.dev hesabı, eas-cli (npx eas-cli login)

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$Mobile = Join-Path $Root "mobile"
$Dest = Join-Path $Root "public\downloads\cokusta-usta.apk"

Write-Host "1) mobile klasöründe bağımlılıklar..."
Set-Location $Mobile
npm install

Write-Host "2) EAS ile Android APK build (cloud, ~10-20 dk)..."
Write-Host "   İlk kez: npx eas-cli login"
npx eas-cli build --platform android --profile preview --non-interactive

Write-Host ""
Write-Host "Build bitince Expo panelinden APK indirin, sonra:"
Write-Host "  Copy-Item .\indirilen.apk `"$Dest`""
Write-Host "  git add public/downloads/cokusta-usta.apk"
Write-Host "  git commit + deploy (Vercel)"
Write-Host ""
Write-Host "Alternatif: Vercel ortam degiskeni NEXT_PUBLIC_USTA_APK_URL = Expo build indirme linki"
