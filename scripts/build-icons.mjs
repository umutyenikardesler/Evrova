// Uygulama ikonlarını üretir: giriş/ana sayfa başlığındaki yeşil (#B9F227) kutulu, koyu şimşek.
//   npm run icons
// Üretilenler (assets/): icon.png (iOS+genel), android-icon-foreground.png, android-icon-monochrome.png,
// splash-icon.png, favicon.png. Android arka planı app.json'da düz renktir (adaptiveIcon.backgroundColor).
import sharp from 'sharp';

const LIME = '#B9F227';
const INK = '#101827';
// Uygulamadaki "zap" ikonuyla aynı yol (24x24 görünüm kutusu)
const BOLT =
  'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z';

/** Şimşek: canvas içinde, ortada, `box` px genişliğinde 24'lük kutu olarak çizilir. */
const bolt = (canvas, box, color) => {
  const s = box / 24;
  const o = (canvas - box) / 2;
  return `<g transform="translate(${o} ${o}) scale(${s})"><path d="${BOLT}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g>`;
};

const svg = (size, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${body}</svg>`;
/** opaque: alfa kanalı olmadan yazar (iOS ikonu saydam olamaz; App Store reddeder). */
const write = (file, xml, size = 1024, opaque = false) => {
  let img = sharp(Buffer.from(xml)).resize(size, size);
  if (opaque) img = img.flatten({ background: LIME }).removeAlpha();
  return img.png({ compressionLevel: 9 }).toFile(`assets/${file}`).then(() => console.log('✔', file));
};

// iOS / genel ikon: tam kare, saydamlık yok (iOS köşeleri kendisi yuvarlar). Şimşek kutunun ~%58'i.
await write('icon.png', svg(1024, `<rect width="1024" height="1024" fill="${LIME}"/>${bolt(1024, 600, INK)}`), 1024, true);

// Android adaptive ikon ön planı: saydam zemin, şimşek güvenli alanın (orta %66) içinde.
await write('android-icon-foreground.png', svg(1024, bolt(1024, 580, INK)));

// Android 13+ tema ikonu: tek renk (siyah) şimşek, saydam zemin.
await write('android-icon-monochrome.png', svg(1024, bolt(1024, 580, '#000000')), 432);

// Açılış ekranı: koyu zeminde yuvarlak köşeli yeşil kutu + şimşek (başlıktaki logo gibi).
await write(
  'splash-icon.png',
  svg(1024, `<rect x="112" y="112" width="800" height="800" rx="232" fill="${LIME}"/>${bolt(1024, 420, INK)}`),
);

// Web favicon
await write('favicon.png', svg(1024, `<rect width="1024" height="1024" rx="230" fill="${LIME}"/>${bolt(1024, 600, INK)}`), 48);
