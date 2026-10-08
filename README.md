# Evrova

**Türkiye'de satılan elektrikli araçların liste fiyatlarını takip eden mobil uygulama.**
React Native (Expo) · Android + iOS · Türkçe / English · Firebase (Auth, Firestore, bildirimler)

Tasarım kaynağı: `design-reference/EV App v3.dc.html`

---

## Uygulama ne işe yarar?

Türkiye'de elektrikli araç fiyatları her ay değişiyor ve her marka listesini farklı yerde yayınlıyor. Evrova bunları tek yerde toplar:

- hangi markanın hangi modeli ve paketi ne kadar, nasıl bir menzil/batarya/güç sunuyor,
- bir aracın fiyatı aylar içinde nasıl değişti,
- sevdiğin aracın fiyatı değişince haberin olsun (fiyat alarmı + bildirim),
- elektrikli araçlara uygulanan vergiler (ÖTV, MTV) ne kadar ve alacağın araç için ne kadar vergi ödüyorsun,
- elektrikli mobilite dünyasında neler oluyor (batarya, şarj, motosiklet, yazılım, ticari araç haberleri).

## Neler var?

### Ana sayfa
Güncel liste ayı rozeti, selamlama, "Araçları keşfet" kartı, takip ettiğin araçların bu ayki fiyat değişimi ve hızlı kutular: **Fiyat takibi**, **Haberler**, **Vergi rehberi** (Şarj noktaları yakında). Sağ üstten bildirimlere gidilir.

### Araçlar
**Kategori → Marka → Model → Paket → Detay** akışı. Kategoriler: Tümü / Motosiklet / Otomobil / Kamyonet.

- 160'a yakın araç, 30'dan fazla marka (Togg, Tesla, BMW, Mercedes-Benz, Hyundai, Kia, Renault, Citroën, Peugeot, Opel, Fiat, Ford, VW, Škoda, Audi, Volvo, Polestar, MG, BYD, Cupra, MINI, Toyota, Nissan… ayrıca motosiklet ve kamyonetler).
- Markalar ve modeller **A–Z**, paketler **en düşük fiyattan en yükseğe** sıralanır. Tek paketli model doğrudan detaya gider.
- Üstte **arama kutusu**: marka, model ya da paket adı yazınca (örn. `tesla y`, `ioniq 5`, `4more`) sonuçlar anında listelenir; aksan ve büyük/küçük harf fark etmez.
- Marka logoları ve modele/pakete özel araç fotoğrafları.
- Geri döndüğünde liste kaldığın yerde açılır (başa sarmaz).
- **Araç detayı:** fotoğraf slider'ı (kaydırmalı, atıf satırıyla), batarya/menzil/güç özellikleri, aylık liste fiyatı ve **dokununca/sürükleyince ay ay gösteren 12 aylık fiyat grafiği**, "Takibe al".

### Fiyat takibi
Takibe aldığın araçlar için 12 aylık dokunulabilir sütun grafiği, ay ay fiyat ve değişim yüzdesi tablosu ve **fiyat alarmı** (fiyat %2'den fazla değişirse bildirim).

### Haberler
Batarya, Şarj, Motosiklet, Yazılım ve Ticari kategorilerinde (her birinde en az 3) güncel haberler. Her haberin kendi görseli (atıfıyla) ve **kaynak bağlantısı** var; listede yeniden eskiye sıralanır, kategoriye göre filtrelenir.

### Vergi rehberi
- **Vergi hesaplayıcı:** anahtar teslim fiyatı ve motor gücünü (kW) gir; vergisiz fiyatı (matrah), ÖTV'yi, KDV'yi, toplam vergiyi ve yıllık MTV'yi gösterir.
- **ÖTV tablosu:** motor gücü ve matrah dilimine göre %25 / %55 / %65 / %75.
- **MTV tablosu:** motor gücü × araç yaşı (girdiğin güce denk gelen satır vurgulanır).
- Değerler 2026 içindir ve bilgi amaçlıdır; kesin değerler için gib.gov.tr. Veri: `src/data/taxes.ts`.

### Bildirimler
Fiyat değişimi, yeni haber ve sistem bildirimleri; okundu işaretleme. Gerçek cihazda push bildirimi (Expo + Firebase Cloud Functions).

### Profil
Ad/soyad düzenleme, takip ve alarm sayıları, bildirim ve "kısa fiyat" tercihleri, **dil** (Türkçe/English), **görünüm** (Sistem/Açık/Koyu) ve **para birimi** (TL/USD/EUR, güncel kurla çevrilir), çıkış yapma.

### Genel
- Cam efektli (liquid glass) alt menü, kayan balon animasyonu ve aktif sekmede dolu ikonlar.
- Sağa kaydırarak bir üst seviyeye geri dönme; sekmeler arası kayma geçişi.
- Açık / koyu tema, Türkçe / İngilizce.
- Firebase yapılandırılmamışsa **demo modu** (giriş yerel çalışır, veriler paketten gelir).

---

## Çalıştırma

```bash
npm install
cp .env.example .env      # Firebase web app değerlerini doldur (aşağıya bak)
npx expo start            # Expo Go ile hızlı deneme (bildirimler ve cam efekti hariç)
npm run typecheck         # tsc --noEmit
```

`.env` boşsa uygulama **demo modunda** açılır.

Cam efekti (`expo-blur`) ve push bildirimleri için **development build** gerekir:

```bash
npm i -g eas-cli && eas login
eas build --profile development --platform android   # ve/veya ios
```

Geliştirme build'i `Evrova-Dev` (`com.tumurelsedrakiney.evrova.dev`), yayın build'i `Evrova` (`com.tumurelsedrakiney.evrova`) adıyla ayrı kurulur; ayrım `app.config.js` içinde `APP_VARIANT=development` ile yapılır. EAS'a FCM V1 servis hesabı anahtarını (Android) ve APNs anahtarını (iOS) yüklemeyi unutma.

## Firebase kurulumu (proje: `evrova-df707`)

1. **Web uygulaması**: Console > Project settings > General > *Add app* > Web `</>` → `apiKey`, `messagingSenderId`, `appId` değerlerini `.env` dosyasına yaz.
2. **Authentication** > Sign-in method > *Email/Password* etkinleştir.
3. **Firestore Database** oluştur, kuralları yükle: `firebase deploy --only firestore:rules`
4. **Örnek veriyi yükle**: Service accounts > *Generate new private key* → `serviceAccount.json` olarak kök dizine koy, sonra `npm run seed` (`--vehicles-only` yalnızca araçları yazar).
5. **Android/iOS uygulamaları**: `com.tumurelsedrakiney.evrova` ve `.dev` paketleriyle ekle; `google-services.json` ve `GoogleService-Info.plist` dosyalarını kök dizine koy. EAS build'de `google-services.json` için `GOOGLE_SERVICES_JSON` dosya ortam değişkeni kullanılır.

`serviceAccount.json`, `google-services.json` ve `.env` depoya girmez (`.gitignore`).

## Bildirimler

- İzin isteme, Android kanalı, token kaydı: `src/services/notifications.ts` — token'lar `users/{uid}` belgesine yazılır.
- Bildirime dokununca ilgili ekran açılır (`src/navigation/NavContext.tsx`).
- Gönderim: `functions/index.js`
  - `notifications/{id}` belgesi eklenince → bildirimi açık herkese,
  - `vehicles/{id}` fiyatı %2'den fazla değişince → o aracın alarmını açmış kullanıcılara.
  - Dağıtım: `cd functions && npm i && cd .. && firebase deploy --only functions` (Blaze planı gerekir).

## Klasör yapısı

```
App.tsx                    Giriş noktası (font, provider'lar, giriş/ana kabuk seçimi)
src/
  components/              Ortak bileşenler (Icon, TabBar, Glass, Chips, PriceLineChart, Toast ...)
  context/AppContext.tsx   Kullanıcı, profil, veri, dil, para birimi, toast
  data/                    Araç kataloğu (vehicles.ts), aylık fiyatlar (monthlyPrices.ts), haberler (news.ts),
                           vergiler (taxes.ts), logo/görsel eşlemeleri (otomatik üretilir)
  firebase/                config, auth, firestore
  i18n/                    tr.ts, en.ts
  navigation/              NavContext (sekme + seviye durumu, geri), MainShell (kaydırma, geçiş, alt menü)
  screens/                 auth · home · vehicles · prices · news · tax · notifications · profile
  services/notifications.ts
  theme/                   renkler, açık/koyu tema
  utils/                   fiyat/yüzde/zaman biçimleri, para birimi, ay etiketleri, marka/model yardımcıları
assets/
  brands/                  Marka logoları
  vehicles/<marka>/<model>/  Araç fotoğrafları (+ paket klasörleri, credits.json / CREDITS.md)
  news/<kategori>/<yayın-tarihi>/  Haber görselleri (+ credits.json)
data/official-prices.json  Marka resmi sitelerinden doğrulanmış fiyatlar
functions/                 Cloud Functions (push gönderimi)
scripts/                   Veri ve görsel araçları (aşağıya bak)
firestore.rules            Güvenlik kuralları
```

Dosyalar 1000 satırın altında tutulur.

## Veri ve fiyatlar

Fiyatlar **liste fiyatıdır** (opsiyonlar hariç). Katalog `src/data/vehicles.ts` içindedir: satırlardaki fiyat taban ayın (Eylül 2026) listesidir, sonraki aylar `src/data/monthlyPrices.ts` içinde tutulur. 12 aylık seri son listeden geriye kurulur: kayıtlı aylar gerçek, kayıttan önceki aylar simülasyondur (aylar geçtikçe simülasyon dışarı kayar). Ay etiketleri bu veriden türetilir; elle değiştirmek gerekmez.

### Aylık fiyat güncelleme

Fiyat listeleri her ayın ilk haftasında yayınlanır.

- **Resmi kaynak önceliklidir:** Marka resmi sitelerinden doğrulanan fiyatlar `data/official-prices.json` dosyasına (kaynak notuyla) yazılır; bu dosya aggregator verisinin üzerine yazılır. Zamanlanmış bir Claude görevi (`evrova-monthly-official-prices`, ayın 2–8'i her gün 10:00) bu doğrulamayı yapar; okunamayan siteler "doğrulanamadı" diye raporlanır.
- **Yedek:** `scripts/update-prices.mjs` DonanımHaber + hibritelektrik.com listelerini okuyup araçlarla eşleştirir ve `src/data/monthlyPrices.ts` dosyasına o ayı ekler (`npm run prices`, yazmadan görmek için `--dry`). Resmi doğrulanmamış araçlar için kullanılır.
- **Otomatik çalıştırma:** `.github/workflows/update-prices.yml` her ayın 1–7'sinde çalışır; değişiklik varsa dosyayı commit eder ve (GitHub'da `FIREBASE_SERVICE_ACCOUNT` secret'ı varsa) fiyatları Firestore'a yazar.
- Listede bulunamayan araçların fiyatı önceki ayki gibi kalır; rapor edilir.

## Betikler

| Komut | Ne yapar |
|---|---|
| `npm run seed` | Araç, haber ve bildirimleri Firestore'a yazar |
| `npm run prices` | Aylık fiyat güncelleyici |
| `npm run logos` | Marka logolarını üretir |
| `npm run icons` | Uygulama ikonlarını üretir |
| `node scripts/fetch-vehicle-images.mjs [marka]` | Araç fotoğraflarını Wikimedia Commons'tan indirir, eşlemeyi üretir |
| `npm run news:build` | Haber görsellerini indirir ve `src/data/newsData.ts`'i üretir (kaynak: `data/news-items.json`) |
| `node scripts/news-add.mjs <dosya.json>` | Yeni haberleri doğrular, ekler, görsellerini indirir (`--dry` yalnızca doğrular, `--due` 36 saat doldu mu?) |
| `npm run seed:news` | Yalnızca haberleri Firestore'a yazar; yeni haber varsa en yenisi için 1 bildirim oluşturur |
| `node scripts/commons-search.mjs "sorgu"` | Commons'ta serbest lisanslı görsel arar |

**Haberler (otomatik):** Zamanlanmış Claude görevi `evrova-news-scan` her 6 saatte tetiklenir; son taramadan **36 saat** geçtiyse (`data/news-state.json`) kategorilere (Batarya, Şarj, Motosiklet, Yazılım, Ticari) göre güncel haberleri tarar, kaynağı açıp doğrular, kendi cümleleriyle TR/EN yazar, Commons'tan uygun görsel seçer ve `news-add.mjs` ile ekler; ardından `npm run seed:news` ile Firestore'a yazar. Böylece yeni haberler uygulama güncellemesi gerekmeden görünür (yeni haberlerin görseli kendi Commons bağlantısından yüklenir). Haberler `data/news-items.json` dosyasında tutulur; 120 günden eskiler listeden çıkar. Görev commit/push yapmaz.

**Haberi elle eklemek:** `data/news-items.json` içine kaydı ekle (`images`: Commons dosya adları), `npm run news:build`, sonra `npm run seed:news`.

**Yeni araç/paket eklemek:** `src/data/vehicles.ts` içine satırı ekle, `node scripts/fetch-vehicle-images.mjs <marka>` ile fotoğrafını al.

## Lisans ve atıflar

Araç ve haber fotoğrafları Wikimedia Commons'tan serbest lisanslıdır; yazar ve lisans bilgisi uygulamada fotoğrafın altında ve `assets/vehicles/CREDITS.md`, `assets/news/credits.json` dosyalarında yer alır. Haberler kaynak sayfalardan özetlenip yeniden yazılmıştır ve kaynağına bağlantı verir.
