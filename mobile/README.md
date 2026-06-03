# Çok Usta — Usta Mobil Uygulaması

Onaylı ustalar için **ilçe bazlı talep uyarısı** (ses + titreşim + bildirim).

## Hızlı başlangıç (telefonda test)

1. Telefona [Expo Go](https://expo.dev/go) kurun.
2. Bilgisayarda:

```bash
cd mobile
npm install
npx expo start
```

3. QR kodu Expo Go ile okutun.
4. Usta telefonu + 4 haneli PIN ile giriş yapın (web ile aynı hesap).

## Ne yapar?

- İlçe seçin → o ilçede yeni talep açılınca **uyarı**
- Açık talepleri listeler
- Talebe dokununca **web usta paneli** açılır (teklif verme)
- 45 saniyede bir arka planda kontrol

## Play Store APK (test)

Expo hesabı gerekir ([expo.dev](https://expo.dev) ücretsiz kayıt):

```bash
npm install -g eas-cli
eas login
cd mobile
eas build --platform android --profile preview
```

Build bitince indirilen **APK**’yı telefona yükleyebilirsiniz.

## Play Store / App Store (yayın)

```bash
eas build --platform android --profile production   # AAB
eas build --platform ios --profile production     # IPA (Apple Developer gerekir)
eas submit --platform android
```

`app.json` içinde `com.cokusta.usta` paket adını kendi hesabınıza göre güncelleyin.

## API

Canlı: `https://www.cokusta.com` (www zorunlu — apex yönlendirmesi mobil POST’u bozabilir)

Yerel Next.js:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.X:3000 npx expo start
```

## Gereksinimler

- Usta hesabı **onaylı** olmalı
- Giriş şifresi webden (`/usta/giris`) bir kez belirlenmeli
- Bildirim izni verilmeli (sesli uyarı için)

## Sonraki adımlar (isteğe bağlı)

- FCM push (uygulama kapalıyken anlık uyarı)
- Uygulama içinden teklif verme
- Müşteri mobil uygulaması
