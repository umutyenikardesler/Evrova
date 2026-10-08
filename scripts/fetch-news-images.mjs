// Haber görsellerini Wikimedia Commons'tan (serbest lisanslı) indirir.
//
//   assets/news/<kategori>/<yayın-tarihi>/<haber-id>.jpg      -> haberin kapak görseli (klasör adı YYYY-MM-DD)
//   assets/news/<kategori>/<yayın-tarihi>/<haber-id>-2.jpg    -> aynı haberin ek görselleri (varsa)
//   assets/news/credits.json                                  -> lisans/atıf
//   src/data/newsImages.ts                                    -> uygulamanın kullandığı eşleme (otomatik üretilir)
//
// Haber eklemek için data/news-items.json içindeki kayda "images": [Commons dosya adları] yazılır (ilki kapak); betik klasörü açıp indirir.
// Habere özel görsel yoksa uygulama aynı kategorideki ilk görseli kullanır.
//
//   node scripts/fetch-news-images.mjs           -> eksik olanları indirir
//   node scripts/fetch-news-images.mjs --force   -> hepsini yeniden indirir
//   node scripts/fetch-news-images.mjs --build   -> internete gitmeden eşlemeyi yeniden üretir
//
// Elle koyduğun dosya (aynı yol/ad) atıf listesinde yoksa "Elle eklendi" sayılır ve ezilmez.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const UA = 'evrova-image-fetch/1.0 (umutyenikardesler@gmail.com)';
const DIR = 'assets/news';
const CREDITS = `${DIR}/credits.json`;
const OUT = 'src/data/newsImages.ts';
const force = process.argv.includes('--force');
const buildOnly = process.argv.includes('--build');

/** Haber id'si -> kategori, yayın tarihi ve Commons dosya adları: data/news-items.json'dan okunur (tek kaynak). */
const PICKS = JSON.parse(readFileSync('data/news-items.json', 'utf8'))
  .filter((n) => n.images?.length)
  .map((n) => ({ id: n.id, cat: n.cat, date: n.published, titles: n.images }));

/** Haberin dosyaları: ilki <id>.jpg, sonrakiler <id>-2.jpg ... */
const filesOf = (p) =>
  p.titles.map((title, i) => ({ title, file: `${DIR}/${p.cat}/${p.date}/${p.id}${i ? `-${i + 1}` : ''}.jpg` }));

const strip = (h) => (h ?? '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const credits = existsSync(CREDITS) ? JSON.parse(readFileSync(CREDITS, 'utf8')) : {};

if (!buildOnly) {
  for (const p of PICKS) {
    for (const { title, file } of filesOf(p)) {
      if (existsSync(file) && credits[file] && !force) continue;
      const api = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1200&titles=' + encodeURIComponent('File:' + title);
      const r = await (await fetch(api, { headers: { 'User-Agent': UA } })).json();
      const info = Object.values(r.query.pages)[0].imageinfo?.[0];
      if (!info) { console.log(`✗ ${p.id}: Commons'ta bulunamadı (${title})`); continue; }
      const buf = Buffer.from(await (await fetch(info.thumburl, { headers: { 'User-Agent': UA } })).arrayBuffer());
      mkdirSync(`${DIR}/${p.cat}/${p.date}`, { recursive: true });
      await sharp(buf).resize({ width: 960, withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true }).toFile(file);
      const m = info.extmetadata ?? {};
      credits[file] = {
        title, author: strip(m.Artist?.value) || 'Bilinmiyor', license: strip(m.LicenseShortName?.value) || '',
        page: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(title.replace(/ /g, '_'))}`,
      };
      console.log(`✔ ${p.id} (${p.cat}/${p.date}) ${credits[file].author} · ${credits[file].license}`);
      await new Promise((res) => setTimeout(res, 500));
    }
  }
  // PICKS'te olmayan (eski) atıf kayıtlarını temizle
  const keep = new Set(PICKS.flatMap((p) => filesOf(p).map((x) => x.file)));
  for (const k of Object.keys(credits)) if (!keep.has(k)) delete credits[k];
  writeFileSync(CREDITS, JSON.stringify(credits, null, 2) + '\n');
}

// Eşleme üret: haber id'si ve kategori (yedek) -> görsel
const entries = PICKS.map((p) => ({
  ...p,
  imgs: filesOf(p)
    .filter((x) => existsSync(x.file))
    .map((x) => ({ f: x.file, c: credits[x.file] ?? { author: 'Elle eklendi', license: '', page: '', title: x.title } })),
})).filter((e) => e.imgs.length);

const img = ({ f, c }) =>
  `{ src: require('../../${f}'), author: ${JSON.stringify(c.author)}, license: ${JSON.stringify(c.license)}, page: ${JSON.stringify(c.page)}, title: ${JSON.stringify(c.title)} }`;
const byCat = new Map();
for (const e of entries) if (!byCat.has(e.cat)) byCat.set(e.cat, e);

writeFileSync(
  OUT,
  [
    `// OTOMATİK ÜRETİLDİ: scripts/fetch-news-images.mjs (kaynak: assets/news/<kategori>/<yayın-tarihi>/). Elle düzenleme.`,
    `// NEWS_GALLERY: haberin tüm görselleri (kapak ilk sırada), NEWS_CAT_IMAGES: kategori yedeği. Lisans/atıf: assets/news/credits.json`,
    `export interface NewsImage { src: number; author: string; license: string; page: string; title: string }`,
    `export const NEWS_GALLERY: Record<string, NewsImage[]> = {`,
    ...entries.map((e) => ` ${JSON.stringify(e.id)}: [${e.imgs.map(img).join(', ')}],`),
    `};`,
    `export const NEWS_CAT_IMAGES: Record<string, NewsImage> = {`,
    ...[...byCat].map(([cat, e]) => ` ${JSON.stringify(cat)}: ${img(e.imgs[0])},`),
    `};`,
    `/** Haberin görselleri (kapak ilk); habere özel görsel yoksa kategorinin görseli; o da yoksa boş liste. */`,
    `export const newsImages = (n: { id: string; cat: string }): NewsImage[] =>`,
    `  NEWS_GALLERY[n.id] ?? (NEWS_CAT_IMAGES[n.cat] ? [NEWS_CAT_IMAGES[n.cat]] : []);`,
    `export const newsImage = (n: { id: string; cat: string }): NewsImage | undefined => newsImages(n)[0];`,
    ``,
  ].join('\n'),
);
console.log(`\n${OUT} üretildi (${entries.length} haber).`);
