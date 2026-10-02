// Araç fotoğraflarını Wikimedia Commons'tan (serbest lisanslı) bulup indirir.
//
//   assets/vehicles/<marka>/<model>/model.jpg        -> modelin kapak fotoğrafı
//   assets/vehicles/<marka>/<model>/<paket>.jpg      -> pakete özel fotoğraf (bulunabildiyse)
//
// Lisans/atıf: assets/vehicles/credits.json + CREDITS.md. Uygulamanın kullandığı eşleme: src/data/vehicleImages.ts
//
//   node scripts/fetch-vehicle-images.mjs            -> eksik olanları indirir
//   node scripts/fetch-vehicle-images.mjs BMW        -> adı eşleşenler
//   node scripts/fetch-vehicle-images.mjs --force X  -> eşleşenleri yeniden ara/indir
//   node scripts/fetch-vehicle-images.mjs --build    -> internete gitmeden eşlemeyi yeniden üret
//
// Otomatik seçim hatalı olabilir: istediğin resmi aynı yola (aynı adla) koyup --build çalıştır.
// Elle koyduğun dosyalar atıf listesinde "Elle eklendi" olarak işaretlenir ve ezilmez.
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { VEHICLES } from '../src/data/vehicles.ts';

const UA = 'evrova-image-fetch/1.0 (umutyenikardesler@gmail.com)';
const DIR = 'assets/vehicles';
const CREDITS = `${DIR}/credits.json`;
const OUT = 'src/data/vehicleImages.ts';

const args = process.argv.slice(2);
const buildOnly = args.includes('--build');
const force = args.includes('--force');
const recompress = args.includes('--recompress');
const only = args.find((a) => !a.startsWith('--'))?.toLowerCase();

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const slug = (s) => norm(s).replace(/ /g, '-');
const BAD_WORDS = 'interior|dashboard|cockpit|engine|battery|charging|charger|logo|badge|emblem|wheel|detail|seat|trunk|display|screen|console|steering|headlight|taillight|rear|back|plan|diagram|brochure|poster|crash|production|factory|plant|key|door|boot|cargo|infotainment|map|chassis|drawing|sketch|render|concept';
const badRe = (allow = []) => new RegExp(BAD_WORDS.split('|').filter((w) => !allow.includes(w)).join('|'), 'i');
const BAD = badRe();

/** Galeri kategorileri: başlıkta aranan ifade + o kategoride serbest bırakılan kelimeler */
const CATS = {
  rear: { word: 'rear', title: /rear|back|heck/i, allow: ['rear', 'back', 'taillight'] },
  interior: { word: 'interior', title: /interior|dashboard|cockpit|innenraum|cabin/i, allow: ['interior', 'dashboard', 'cockpit', 'display', 'screen', 'console', 'steering', 'seat', 'infotainment'] },
  side: { word: 'side view', title: /side|profile|seite/i, allow: [] },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (h) => (h ?? '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/** Otomatik aramada yanlış/eski nesil çıkan modeller: fotoğraf atlanır (elle koyulabilir). */
const EXCLUDE = new Set([
  'Opel|Corsa-e', 'Opel|Grandland', 'Peugeot|E-3008', 'Ford|Capri',
  'Mercedes-Benz|EQS', 'Mercedes-Benz|G', 'MG|MG5', 'smart|#1', 'Opel|Combo', 'Ford|E-Transit', 'Fiat|E-Doblo Cargo',
  // Elle seçildi / uygun fotoğraf yok:
  'Ford|E-Transit Custom', 'Peugeot|e-2008|Allure 115 kW', 'Ford|Journey Courier BEV|Titanium 100 kW',
]);

/** Commons'ta farklı adla geçen modeller için arama adı. */
const ALIAS = {
  'Ford|Explorer BEV': 'Explorer', 'Škoda|Elroq 60': 'Elroq', 'Škoda|Enyaq Coupé 60': 'Enyaq Coupé',
  'Jeep|Avenger Electric': 'Avenger', 'Ford|Journey Courier BEV': 'Courier',
};

/** Modele özel engellenen başlık kalıpları (aynı adlı klasik/eski modeller). */
const BLOCK = {
  'Citroën|Ami': /ami 8|ami 6|break|super|interiors|vert/i,
};

/** Elle seçilen Commons dosyaları (otomatik arama yanlış/eski nesil bulduğunda). Anahtar: "Marka|Model" */
const MANUAL = {
  'Citroën|ë-C3 Aircross': 'Citroën ë-C3 Aircross DSC 8364.jpg',
  'Citroën|ë-C4': 'Citroën ë-C4 Feel (III) – f 14042024.jpg',
  'Citroën|Ami': 'Citroën Ami (3).jpg',
};

/** Elle seçilen paket fotoğrafı. Anahtar: "Marka|Model|Paket" */
const MANUAL_TRIM = {
  'Tesla|Model Y|Standart Menzil Arkadan Çekiş': 'Tesla Model Y Standard front view dllu.jpg',
  'Tesla|Model Y|Premium Uzun Menzil Arkadan Çekiş': 'Tesla Model Y Juniper Long Range RWD Quicksilver 01.jpg',
  'Tesla|Model Y|Premium Uzun Menzil Dört Çeker': '2025 Tesla Model Y Juniper Long Range AWD.jpg',
  'Tesla|Model Y|Performance Dört Çeker': 'Tesla Model Y Juniper Performance White Pearl 01.jpg',
};

/**
 * Elle seçilen galeri (slider) fotoğrafları. Anahtar: "Marka|Model" (tüm paketler) ya da "Marka|Model|Paket".
 * Paket galerisi varsa o paketin detayında model galerisi yerine o kullanılır.
 */
const MANUAL_GALLERY = {
  'Citroën|Ami': ['Citroën Ami (2).jpg', 'Citroën Ami (5).jpg', 'Citroën Ami (7).jpg'],
  'Tesla|Model Y|Standart Menzil Arkadan Çekiş': ['Tesla Model Y Standard dllu.jpg'],
  'Tesla|Model Y|Premium Uzun Menzil Arkadan Çekiş': [
    'Tesla Model Y Juniper Long Range RWD Quicksilver 02.jpg', '2025 Tesla Model Y Juniper Long Range RWD.jpg',
    '2025 Tesla Model Y Juniper Long Range RWD (Rear).jpg',
  ],
  'Tesla|Model Y|Premium Uzun Menzil Dört Çeker': [
    'Tesla Model Y Juniper Long Range AWD White + Black 01.jpg', 'Tesla Model Y Juniper Long Range AWD Stealth Grey 01.jpg',
    'Tesla Model Y Juniper Long Range AWD Ultra Red 01.jpg',
  ],
  'Tesla|Model Y|Performance Dört Çeker': [
    'Tesla Model Y Juniper Performance White Pearl 02.jpg',
    'Tesla Model Y Performance (2025) autoMOBIL Tübingen 2025 DSC 2801.jpg',
    'Tesla Model Y Performance (Facelift) – h 19102025.jpg',
  ],
};

/** Otomatik galeri aranmayacak modeller (nesil/paket karışıklığı: elle yönetilir). */
const NO_AUTO_GALLERY = new Set(['Tesla|Model Y']);

/** Paket adından arama anahtar kelimesi (ilk eşleşen). */
const TRIM_KEYS = [
  [/Performance/i, 'Performance'], [/Uzun Menzil/i, 'Long Range'], [/Standart Menzil/i, 'Standard Range'],
  [/Premium/i, 'Premium'], [/GT-Line/i, 'GT-Line'], [/Night Edition/i, 'Night Edition'], [/Edition M Sport/i, 'Edition M Sport'],
  [/M Sport/i, 'M Sport'], [/Sport Line/i, 'Sport Line'], [/X-Line/i, 'xLine'], [/AMG/i, 'AMG'], [/Obsidiyen/i, 'Obsidian'],
  [/4More/i, '4More'], [/Calligraphy/i, 'Calligraphy'], [/Titanium/i, 'Titanium'], [/Excellence/i, 'Excellence'],
  [/Giorgio Armani/i, 'Armani'], [/Dark Side/i, 'Dark Side'], [/Sunrise/i, 'Sunrise'], [/Sunset/i, 'Sunset'],
  [/La Prima/i, 'La Prima'], [/Prestige/i, 'Prestige'], [/Elegance/i, 'Elegance'], [/Advance/i, 'Advance'],
  [/Progressive/i, 'Progressive'], [/Allure/i, 'Allure'], [/\bGT\b/i, 'GT'], [/Cool/i, 'Cool'], [/Select/i, 'Select'],
  [/Deluxe/i, 'Deluxe'], [/Dynamic/i, 'Dynamic'], [/Plus/i, 'Plus'], [/Esprit Alpine/i, 'Alpine'], [/\bMax\b/i, 'Max'],
  [/Collection/i, 'Collection'], [/Sport/i, 'Sport'], [/Touring/i, 'Touring'],
];
const trimKeyword = (trim) => TRIM_KEYS.find(([re]) => re.test(trim))?.[1];

async function getWithRetry(url, asJson) {
  for (let i = 0; i < 5; i++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) return asJson ? res.json() : Buffer.from(await res.arrayBuffer());
    await sleep(2000 * (i + 1));
  }
  throw new Error('İstek başarısız: ' + url);
}
const api = (params) =>
  getWithRetry('https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', ...params }), true);

/** Elektrikli araç aranıyor: dizel/benzin/hibrit eski nesil fotoğraflar elenir. */
const NOT_EV = /hybrid|hdi|diesel|tdi|phev|plug in|petrol|puretech|bluehdi|tsi|mhev|ecoflex|cdti|1 2 |1 5 |1 6 |2 0 /i;

/** Bu modelin adını önek olarak içeren komşu modellerin ek kelimeleri (ë-C3 -> aircross): başlıkta geçerse elenir. */
function siblingWords(brand, model) {
  const me = norm(model);
  const out = new Set();
  for (const v of VEHICLES) {
    if (v.brand !== brand) continue;
    const o = norm(v.model);
    if (o !== me && o.startsWith(me + ' ')) o.slice(me.length + 1).split(' ').forEach((w) => out.add(w));
  }
  return [...out];
}

/** queries: arama metinleri, mustHave: başlıkta geçmesi gereken kelimeler, skipTitle: seçilmeyecek dosya adı */
async function find(queries, mustHave, skipTitle, exclWords = [], opts = {}) {
  const bad = opts.cat ? badRe(CATS[opts.cat].allow) : BAD;
  const tokens = norm(mustHave).split(' ');
  let best = null;
  for (const q of queries) {
    const j = await api({
      action: 'query', generator: 'search', gsrnamespace: '6', gsrlimit: '25', gsrsearch: `${q} filetype:bitmap`,
      prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '720',
      iiextmetadatafilter: 'LicenseShortName|Artist|NonFree',
    });
    for (const p of Object.values(j.query?.pages ?? {})) {
      const ii = p.imageinfo?.[0];
      if (!ii || !/jpeg|png/.test(ii.mime) || !ii.thumburl) continue;
      const lic = ii.extmetadata?.LicenseShortName?.value ?? '';
      if (!/^(CC|Public domain|PD|Attribution)/i.test(lic) || ii.extmetadata?.NonFree?.value === 'true') continue;
      const fileTitle = p.title.replace(/^File:/, '');
      if (fileTitle === skipTitle || opts.skip?.has(fileTitle)) continue;
      const title = norm(fileTitle);
      if (bad.test(title) || NOT_EV.test(title)) continue;
      if (/\b(19\d\d|200\d)\b/.test(title)) continue; // klasik / eski araçlar
      if (opts.block?.test(title)) continue;
      if (opts.cat && !CATS[opts.cat].title.test(title)) continue;
      if (exclWords.some((w) => title.split(' ').includes(w))) continue;
      if (ii.width < 900 || ii.width / ii.height < 1.25 || ii.width / ii.height > 2.4) continue;
      const words = title.split(' ');
      if (tokens.some((t) => (t.length <= 2 ? !words.includes(t) : !title.includes(t)))) continue;
      let score = 10 + Math.min(ii.width, 3000) / 1000;
      if (/front|\bfv\b|3 4/.test(title)) score += 1;
      if (/\b(19|20)\d\d\b/.test(title)) score += 0.5;
      if (!best || score > best.score) {
        best = {
          score, url: ii.thumburl, mime: ii.mime, page: ii.descriptionurl, license: lic,
          author: strip(ii.extmetadata?.Artist?.value) || 'Wikimedia Commons', title: fileTitle,
        };
      }
    }
    if (best) break;
  }
  return best;
}

/** Dosya adı belli bir Commons görselinin bilgisini getirir. */
async function byTitle(fileTitle) {
  const j = await api({
    action: 'query', titles: `File:${fileTitle}`, prop: 'imageinfo', iiprop: 'url|mime|extmetadata', iiurlwidth: '720',
    iiextmetadatafilter: 'LicenseShortName|Artist',
  });
  const p = Object.values(j.query.pages)[0];
  const ii = p.imageinfo?.[0];
  if (!ii) throw new Error(`Dosya bulunamadı: ${fileTitle}`);
  return {
    url: ii.thumburl, mime: ii.mime, page: ii.descriptionurl, license: ii.extmetadata?.LicenseShortName?.value ?? '',
    author: strip(ii.extmetadata?.Artist?.value) || 'Wikimedia Commons', title: fileTitle,
  };
}

const credits = existsSync(CREDITS) ? JSON.parse(readFileSync(CREDITS, 'utf8')) : {};

/**
 * Klasör düzeni (her paketin fotoğrafları ayrı klasörde, karışmaz):
 *   <marka>/<model>/model.jpg                 modelin kapağı
 *   <marka>/<model>/gallery/<n>.jpg           model galerisi (paketi olmayan/ortak)
 *   <marka>/<model>/<paket>/cover.jpg         pakete özel kapak
 *   <marka>/<model>/<paket>/<n>.jpg           pakete özel galeri
 */
function expectedPath(key) {
  const [head, n] = key.split('@');
  const [brand, model, trim] = head.split('|');
  const base = `${slug(brand)}/${slug(model)}`;
  if (n) return trim ? `${base}/${slug(trim)}/${n}.jpg` : `${base}/gallery/${n}.jpg`;
  return trim ? `${base}/${slug(trim)}/cover.jpg` : `${base}/model.jpg`;
}

// Eski düzenden yeni düzene taşı
for (const [key, c] of Object.entries(credits)) {
  if (!c.file) continue;
  const exp = expectedPath(key);
  if (c.file !== exp && existsSync(`${DIR}/${c.file}`)) {
    mkdirSync(`${DIR}/${exp.split('/').slice(0, -1).join('/')}`, { recursive: true });
    renameSync(`${DIR}/${c.file}`, `${DIR}/${exp}`);
    c.file = exp;
  }
}

/** 640 px genişlik, JPEG kalite 72: kurulum boyutunu küçük tutar. */
const toJpeg = (buf) => sharp(buf).resize({ width: 640, withoutEnlargement: true }).jpeg({ quality: 72, mozjpeg: true }).toBuffer();

async function save(key, r) {
  const rel = expectedPath(key);
  mkdirSync(`${DIR}/${rel.split('/').slice(0, -1).join('/')}`, { recursive: true });
  writeFileSync(`${DIR}/${rel}`, await toJpeg(await getWithRetry(r.url, false)));
  credits[key] = { file: rel, title: r.title, author: r.author, license: r.license, page: r.page };
}
const fileExists = (key) => credits[key]?.file && existsSync(`${DIR}/${credits[key].file}`);

if (recompress) {
  // Mevcut tüm fotoğrafları küçült/sıkıştır (png -> jpg). İnternet gerekmez.
  for (const c of Object.values(credits)) {
    if (!c.file || !existsSync(`${DIR}/${c.file}`)) continue;
    const out = await toJpeg(readFileSync(`${DIR}/${c.file}`));
    const rel = c.file.replace(/\.(png|jpe?g)$/i, '.jpg');
    writeFileSync(`${DIR}/${rel}`, out);
    if (rel !== c.file) unlinkSync(`${DIR}/${c.file}`);
    c.file = rel;
  }
}

if (!buildOnly && !recompress) {
  const models = [...new Map(VEHICLES.map((v) => [`${v.brand}|${v.model}`, v])).values()];
  let ok = 0;
  const miss = [];
  // 1) model kapak fotoğrafları
  for (const v of models) {
    const key = `${v.brand}|${v.model}`;
    if (only && !key.toLowerCase().includes(only)) continue;
    if (EXCLUDE.has(key) || (!force && fileExists(key) && (!MANUAL[key] || credits[key].title === MANUAL[key]))) continue;
    try {
      const m = ALIAS[key] ?? v.model;
      const r = MANUAL[key]
        ? await byTitle(MANUAL[key])
        : await find([`${v.brand} ${m}`, `${v.brand} ${m} front`], `${v.brand} ${m}`, undefined, siblingWords(v.brand, v.model));
      if (!r) { miss.push(key); console.log(`✘ ${key}`); continue; }
      await save(key, r);
      ok++;
      console.log(`✔ ${key.padEnd(34)} ${r.title}`);
    } catch (e) { miss.push(key); console.log(`! ${key} ${e.message}`); }
    await sleep(150);
  }
  // 2) pakete özel fotoğraflar (bulunamazsa uygulama model fotoğrafını kullanır)
  let trimOk = 0;
  for (const v of VEHICLES) {
    const key = `${v.brand}|${v.model}|${v.trim}`;
    if (!v.trim || (only && !key.toLowerCase().includes(only))) continue;
    if (EXCLUDE.has(key) || EXCLUDE.has(`${v.brand}|${v.model}`)) continue;
    if (MANUAL_TRIM[key] ? !force && fileExists(key) && credits[key].title === MANUAL_TRIM[key] : !force && (fileExists(key) || credits[key]?.none)) continue;
    const kw = trimKeyword(v.trim);
    if (!kw && !MANUAL_TRIM[key]) continue;
    try {
      const m = ALIAS[`${v.brand}|${v.model}`] ?? v.model;
      const r = MANUAL_TRIM[key]
        ? await byTitle(MANUAL_TRIM[key])
        : await find([`${v.brand} ${m} ${kw}`], `${v.brand} ${m} ${kw}`, credits[`${v.brand}|${v.model}`]?.title, siblingWords(v.brand, v.model));
      if (r) {
        await save(key, r);
        trimOk++;
        console.log(`  ✔ ${key.padEnd(52)} ${r.title}`);
      } else credits[key] = { none: true };
    } catch (e) { console.log(`  ! ${key} ${e.message}`); }
    await sleep(150);
  }
  // 3) galeri (detay sayfasındaki slider): arka, iç mekân, yan görünüm; eksik kalırsa başka açılar. En fazla 3 ek fotoğraf.
  let galOk = 0;
  // 3a) elle seçilen galeriler (model ya da paket düzeyinde)
  for (const [gk, titles] of Object.entries(MANUAL_GALLERY)) {
    if (only && !gk.toLowerCase().includes(only)) continue;
    const current = titles.map((_, i) => credits[`${gk}@${i + 1}`]?.title);
    if (!force && titles.every((t, i) => current[i] === t && fileExists(`${gk}@${i + 1}`))) continue;
    // eski (otomatik) galeriyi sil
    for (const k of Object.keys(credits)) {
      if (k.startsWith(`${gk}@`)) { if (credits[k].file) { try { unlinkSync(`${DIR}/${credits[k].file}`); } catch {} } delete credits[k]; }
    }
    for (let i = 0; i < titles.length; i++) {
      try {
        const r = await byTitle(titles[i]);
        await save(`${gk}@${i + 1}`, r);
        galOk++;
        console.log(`    + ${gk.padEnd(56)} #${i + 1} (elle): ${r.title}`);
      } catch (e) { console.log(`    ! ${gk} ${e.message}`); }
      await sleep(150);
    }
    credits[`${gk}@done`] = { none: true };
  }
  // 3b) otomatik galeriler
  for (const v of models) {
    const mk = `${v.brand}|${v.model}`;
    if (only && !mk.toLowerCase().includes(only)) continue;
    if (EXCLUDE.has(mk) || NO_AUTO_GALLERY.has(mk) || MANUAL_GALLERY[mk] || !fileExists(mk)) continue;
    if (!force && credits[`${mk}@done`]) continue;
    const used = new Set(
      Object.entries(credits)
        .filter(([k]) => k === mk || k.startsWith(`${mk}|`) || k.startsWith(`${mk}@`))
        .map(([, c]) => c.title)
        .filter(Boolean),
    );
    let n = 0;
    while (fileExists(`${mk}@${n + 1}`)) n++;
    const m = ALIAS[mk] ?? v.model;
    for (const cat of ['rear', 'interior', 'side', null, null]) {
      if (n >= 3) break;
      try {
        const q = cat ? [`${v.brand} ${m} ${CATS[cat].word}`] : [`${v.brand} ${m}`, `${v.brand} ${m} front`];
        const r = await find(q, `${v.brand} ${m}`, undefined, siblingWords(v.brand, v.model), { cat, skip: used, block: BLOCK[mk] });
        if (!r) continue;
        n++;
        await save(`${mk}@${n}`, r);
        used.add(r.title);
        galOk++;
        console.log(`    + ${mk.padEnd(30)} #${n} ${cat ?? 'diğer'}: ${r.title}`);
      } catch (e) { console.log(`    ! ${mk} ${e.message}`); }
      await sleep(150);
    }
    credits[`${mk}@done`] = { none: true };
  }
  console.log(`\nModel: ${ok} indirildi, ${miss.length} bulunamadı. Paket: ${trimOk} indirildi. Galeri: ${galOk} eklendi.`);
  if (miss.length) console.log('Bulunamayan modeller:', miss.join(', '));
}

// ---- Eşleme + atıf dosyaları (internetsiz) ---------------------------------
const entries = [];
for (const [key, c] of Object.entries(credits)) {
  if (c.none) continue;
  if (!c.file || !existsSync(`${DIR}/${c.file}`)) { delete credits[key]; continue; }
  entries.push([key, c]);
}
// Elle konmuş (kayıtsız) dosyalar: <marka>/<model>/model.jpg
for (const v of VEHICLES) {
  const key = `${v.brand}|${v.model}`;
  if (credits[key]) continue;
  const f = ['jpg', 'png'].map((e) => `${slug(v.brand)}/${slug(v.model)}/model.${e}`).find((p) => existsSync(`${DIR}/${p}`));
  if (f) { credits[key] = { file: f, title: f, author: 'Elle eklendi', license: '-', page: '' }; entries.push([key, credits[key]]); }
}
writeFileSync(CREDITS, JSON.stringify(credits, null, 1));

const single = entries.filter(([k]) => !k.includes('@'));
const gallery = {};
for (const [k, c] of entries.filter(([k]) => k.includes('@'))) {
  const [mk, i] = k.split('@');
  (gallery[mk] ??= []).push([Number(i), c]);
}
const req = (c) =>
  `{ src: require('../../assets/vehicles/${c.file}'), author: ${JSON.stringify(c.author)}, license: ${JSON.stringify(c.license)}, page: ${JSON.stringify(c.page)}, title: ${JSON.stringify(c.title)} }`;

const ts =
  `// OTOMATİK ÜRETİLDİ: scripts/fetch-vehicle-images.mjs (kaynak: assets/vehicles/<marka>/<model>/). Elle düzenleme.\n` +
  `// Anahtarlar: "Marka|Model" (kapak) ve "Marka|Model|Paket" (pakete özel). Lisans/atıf: assets/vehicles/CREDITS.md\n` +
  `export interface VehicleImage { src: number; author: string; license: string; page: string; title: string }\n` +
  `export const VEHICLE_IMAGES: Record<string, VehicleImage> = {\n` +
  single.map(([k, c]) => ` ${JSON.stringify(k)}: ${req(c)},`).join('\n') +
  `\n};\n\n` +
  `/** Detay sayfası slider'ı için ek fotoğraflar (arka, iç mekân, yan...). Anahtar: "Marka|Model" */\n` +
  `export const VEHICLE_GALLERY: Record<string, VehicleImage[]> = {\n` +
  Object.entries(gallery)
    .map(([mk, list]) => ` ${JSON.stringify(mk)}: [\n${list.sort((a, b) => a[0] - b[0]).map(([, c]) => `  ${req(c)},`).join('\n')}\n ],`)
    .join('\n') +
  `\n};\n`;
writeFileSync(OUT, ts);

writeFileSync(
  `${DIR}/CREDITS.md`,
  `# Araç fotoğrafları — kaynak ve lisanslar\n\n` +
    `Fotoğraflar Wikimedia Commons'tan alınmıştır; yazarları ve lisansları aşağıdadır (CC BY / CC BY-SA atıf gerektirir).\n\n` +
    `| Marka / Model / Paket | Dosya | Yazar | Lisans | Kaynak |\n|---|---|---|---|---|\n` +
    entries
      .map(([k, c]) => `| ${k.replace('@', ' / galeri ').split('|').join(' / ')} | ${c.file} | ${c.author.replace(/\|/g, '/')} | ${c.license} | ${c.page ? `[sayfa](${c.page})` : '-'} |`)
      .join('\n') +
    `\n`,
);
console.log(`Eşleme: ${single.length} kapak/paket + ${entries.length - single.length} galeri fotoğrafı -> ${OUT}`);
