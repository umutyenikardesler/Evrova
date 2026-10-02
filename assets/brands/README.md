# Marka logoları

`assets/brands/<marka-slug>.svg` — araç markalarının logoları. Uygulama bunları `npm run logos` ile
`src/data/brandLogos.ts` dosyasına gömer (yeni logo eklenince/değişince bu komutu çalıştır).

Slug kuralı: küçük harf, aksansız, harf/rakam dışı karakter `-` (Škoda → `skoda`, Mercedes-Benz → `mercedes-benz`).

## Kaynaklar (güncel logolar)
- Simple Icons (CC0 ikon seti): tesla, renault, citroen, opel, peugeot, ford, hyundai, kia, skoda, fiat,
  volkswagen, bmw, audi, volvo, polestar, mg, toyota, nissan, mini, jeep, honda, dacia, yamaha
  (marka renginde; Opel siyaha çevrildi, beyaz zeminde okunsun diye).
- Wikimedia Commons: togg (güncel TOGG logosu, 2021 - yalnızca mavi elmas sembol; tam logo: _togg-full.svg), byd (BYD Auto 2022 logo), chery (Chery logo 2022),
  cupra (Cupra symbol), kgm (KG Mobility brand logo), mercedes-benz (Mercedes-Benz Star 2025-),
  smart (Smart 2022).

Horwin: kullanıcının gönderdiği kırmızı "HW" logosu SVG olarak yeniden çizildi (horwin.svg). Eski PNG: _horwin-full.png.

SERES: kullanıcının gönderdiği oval + ok logosu (PNG, şeffaf zemin) SVG içine gömülüp kırpıldı (seres.svg; kaynak: _seres-full.png). Resmî Seres Group logosu: _seres-full.svg.
Skywell: Skywell Türkiye resmî sitesinin (skywell.com.tr) 512x512 favicon'u — Instagram (@skywellturkiye) profil resmiyle aynı mavi kalkan-U işareti; SVG içine gömüldü ve kırpıldı (tam: _skywell-full.png).

Tüm markaların logosu mevcut; logo bulunamayan bir marka eklenirse uygulama baş harf gösterir.
Tüm logolar ilgili şirketlerin tescilli markalarıdır; yalnızca marka tanımlama amacıyla kullanılır.

## Kategoriye özel logo
Raster logo (PNG/JPG) da olur: `assets/brands/seres.png` koyup `npm run logos` çalıştırman yeterli (SVG aynı adla varsa SVG kullanılır).

Aynı markanın otomobil ve motosiklet logosu farklıysa `<marka>-<tip>.svg` koy (tip: `moto`, `car`, `van`),
ör. `honda-moto.svg` (kanatlı Honda Wing). Uygulama önce bunu, yoksa `<marka>.svg`'yi kullanır.
