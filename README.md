# Evrova

Elektrikli araç fiyat takibi — React Native (Expo) · Android + iOS · Türkçe / English · Firebase (Auth, Firestore, bildirimler).

Tasarım kaynağı: `design-reference/EV App v3.dc.html`

## Çalıştırma

```bash
npm install
cp .env.example .env      # Firebase web app değerlerini doldur (aşağıya bak)
npx expo start            # Expo Go ile hızlı deneme (bildirimler hariç)
```

`.env` boşsa uygulama **demo modunda** açılır: giriş yerel çalışır, veriler paket içindeki örneklerden gelir.

## Firebase kurulumu (proje: `evrova-df707`)

1. **Web uygulaması**: Console > Project settings > General > *Add app* > Web `</>` → verilen `apiKey`, `messagingSenderId`, `appId` değerlerini `.env` dosyasına yaz.
2. **Authentication** > Sign-in method > *Email/Password* etkinleştir.
3. **Firestore Database** oluştur, sonra kuralları yükle: `firebase deploy --only firestore:rules`
4. **Örnek veriyi yükle**: Service accounts > *Generate new private key* → `serviceAccount.json` olarak kök dizine koy, sonra
   `npm i -D firebase-admin` ve `npm run seed`.
5. **Android/iOS uygulamaları**: Console'da `com.tumurelsedrakiney.evrova` paketiyle Android ve iOS uygulaması ekle,
   `google-services.json` ve `GoogleService-Info.plist` dosyalarını kök dizine koy.

## Bildirimler

- İzin isteme, Android kanalı, token kaydı: `src/services/notifications.ts` — token'lar `users/{uid}` belgesine yazılır.
- Bildirime dokununca ilgili ekran açılır (`src/navigation/NavContext.tsx`).
- Gönderim: `functions/index.js`
  - `notifications/{id}` belgesi eklenince → bildirimi açık herkese,
  - `vehicles/{id}` fiyatı %2'den fazla değişince → o aracın alarmını açmış kullanıcılara.
  - Dağıtım: `cd functions && npm i && cd .. && firebase deploy --only functions` (Blaze planı gerekir).
- Push, simülatörde değil **gerçek cihazda** ve **development build** ile çalışır:
  ```bash
  npm i -g eas-cli && eas login && eas init
  eas build --profile development --platform android   # ve/veya ios
  ```
  EAS'a FCM V1 servis hesabı anahtarını (Android) ve APNs anahtarını (iOS) yüklemeyi unutma.

## Klasör yapısı

```
App.tsx                    Giriş noktası (font, provider'lar, giriş/ana kabuk seçimi)
src/
  components/              Ortak bileşenler (Icon, Buttons, Chips, TabBar, Toast, ToggleSwitch ...)
  context/AppContext.tsx   Kullanıcı, profil, veri, dil, toast
  data/                    Paket içi örnek veriler (Firestore boşken/çevrimdışıyken)
  firebase/                config, auth, firestore
  i18n/                    tr.ts, en.ts, translate()
  navigation/              NavContext (sekme + detay durumu, geri tuşu), MainShell
  screens/                 auth · home · vehicles · prices · news · notifications · profile
  services/notifications.ts
  utils/                   format (fiyat, yüzde, zaman), color
functions/                 Cloud Functions (push gönderimi)
firestore.rules            Güvenlik kuralları
scripts/seed.mjs           Firestore'a örnek veri yükleme
```

Hiçbir dosya 200 satırı geçmez (sınır 1000).
