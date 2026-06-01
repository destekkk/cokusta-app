# Çok Usta — Usta Mobil Uygulaması

Onaylı ustalar için **ilçe bazlı talep uyarısı** veren Expo (React Native) uygulaması.

## Özellikler

- Telefon + 4 haneli PIN ile giriş (web ile aynı hesap)
- İlçe seçimi — sadece o ilçedeki yeni talepler için uyarı
- **45 saniyede bir** kontrol; yeni talepte titreşim + bildirim sesi
- Uygulama ön plandayken anlık uyarı; arka planda sistem bildirimi

## Kurulum

```bash
cd mobile
npm install
npx expo start
```

Telefonda **Expo Go** ile QR kodu okutun veya:

```bash
npx expo run:android
npx expo run:ios
```

## API adresi

Canlı site varsayılan: `https://cokusta.com`

Yerel geliştirme için `.env` veya komut satırı:

```bash
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000 npx expo start
```

(Bilgisayar IP’si — emülatörde `10.0.2.2:3000` Android)

## Backend uçları

| Uç | Açıklama |
|----|----------|
| `POST /api/mobile/usta/giris` | Token döner |
| `GET /api/mobile/usta/profil` | Usta + ilçe listesi |
| `GET /api/mobile/usta/talepler?district=` | Açık talepler |
| `GET /api/mobile/usta/yeni-talepler?district=&since=` | Poll için yeni talepler |

Authorization: `Bearer {token}`

## Mağaza yayını

Play Store / App Store için:

```bash
npx expo prebuild
eas build --platform all
```

`app.json` içinde `bundleIdentifier` / `package` güncelleyin.

## Notlar

- Usta profilinde il bilgisi vardır; ilçe uygulama içinde seçilir.
- Uygulama tamamen kapalıyken anlık uyarı için ileride push notification (FCM) eklenebilir.
- İlk giriş şifresi web panelinden (`/usta/giris`) belirlenmelidir.
