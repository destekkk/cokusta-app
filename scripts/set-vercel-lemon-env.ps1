# Lemon Squeezy env'lerini Vercel'e ekler.
# Önce: vercel login
# Sonra: vercel link  (proje: cokusta-app)
# Kullanım:
#   $env:LEMONSQUEEZY_API_KEY="jwt..."
#   $env:LEMONSQUEEZY_WEBHOOK_SECRET="whsec..."   # Lemon panel → Webhooks
#   .\scripts\set-vercel-lemon-env.ps1

param(
  [string]$ApiKey = $env:LEMONSQUEEZY_API_KEY,
  [string]$WebhookSecret = $env:LEMONSQUEEZY_WEBHOOK_SECRET
)

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

if (-not $ApiKey -and -not $env:LEMONSQUEEZY_API_KEY) {
  Write-Warning "LEMONSQUEEZY_API_KEY olmadan devam ediliyor (store/variant only)."
}

$vars = @{
  LEMONSQUEEZY_STORE_ID             = "396670"
  LEMONSQUEEZY_STORE_SLUG           = "cokusta"
  LEMONSQUEEZY_TEST_MODE            = "true"
  LEMONSQUEEZY_VARIANT_KONTOR_5     = "1758264"
}

if ($ApiKey) {
  $vars["LEMONSQUEEZY_API_KEY"] = $ApiKey
} else {
  Write-Warning "LEMONSQUEEZY_API_KEY yok — sadece store/variant env'leri eklenir. API key'i panelden veya `$env:LEMONSQUEEZY_API_KEY ile verin."
}

if ($WebhookSecret) {
  $vars["LEMONSQUEEZY_WEBHOOK_SECRET"] = $WebhookSecret
} else {
  Write-Warning "LEMONSQUEEZY_WEBHOOK_SECRET yok — webhook doğrulama çalışmaz. Lemon panelden ekleyip tekrar çalıştırın."
}

$envs = @("production", "preview", "development")

foreach ($name in $vars.Keys) {
  $value = $vars[$name]
  foreach ($target in $envs) {
    Write-Host "Ekleniyor: $name ($target)..."
    $value | vercel env add $name $target 2>&1 | Out-Host
  }
}

Write-Host ""
Write-Host "Tamam. Son adim: vercel --prod deploy  veya GitHub push ile redeploy."
Write-Host "Kontrol: https://www.cokusta.com/api/payments/status -> lemonSqueezy: true"
