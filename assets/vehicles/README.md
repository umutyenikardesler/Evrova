# Araç fotoğrafları

Klasör düzeni (her paketin fotoğrafları ayrı klasörde; paketler birbirine karışmaz):

```
<marka>/<model>/model.jpg              modelin kapağı (model listesinde görünür)
<marka>/<model>/gallery/1.jpg ...      model galerisi (paketi olmayan ortak fotoğraflar)
<marka>/<model>/<paket>/cover.jpg      pakete özel kapak (paket listesi + slider'ın ilk resmi)
<marka>/<model>/<paket>/1.jpg ...      pakete özel galeri (slider)
```

Detay sayfasındaki slider: pakete özel galeri varsa yalnızca o paketin fotoğrafları gösterilir;
yoksa paket kapağı + model kapağı + model galerisi gösterilir.

Fotoğraf eklemek/değiştirmek: dosyayı ilgili yola aynı adla koy, sonra
`node scripts/fetch-vehicle-images.mjs --build`. Otomatik indirme için: `node scripts/fetch-vehicle-images.mjs [Marka]`.
Elle seçimler `scripts/fetch-vehicle-images.mjs` içindeki `MANUAL`, `MANUAL_TRIM`, `MANUAL_GALLERY` tablolarında.
Kaynak / yazar / lisans bilgisi: `CREDITS.md`.
