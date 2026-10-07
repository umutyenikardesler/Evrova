// Aylık fiyat güncelleyici. Her ayın ilk haftasında yayınlanan liste fiyatlarını okur, uygulamadaki araçlarla
// eşleştirir ve src/data/monthlyPrices.ts dosyasına o ayın fiyatlarını yazar.
//
// Kaynaklar (öncelik sırasıyla; ikincisi yalnızca birincide bulunmayan araçlar için kullanılır):
//   1) DonanımHaber "Türkiye'de satılan elektrikli otomobil fiyatları"   (tablo başlığındaki ay kullanılır)
//   2) hibritelektrik.com "Elektrikli araç fiyat listesi"                 (Audi, Volvo, Polestar, MG... )
//
//   node scripts/update-prices.mjs              -> en yeni ayı işler ve yazar
//   node scripts/update-prices.mjs --dry        -> dosyayı yazmadan raporlar
//   node scripts/update-prices.mjs --force      -> aşırı fiyat değişimi korumasını (±%40) atlar
//
// Ay, DonanımHaber tablo başlığından ("... (Ekim 2026)") okunur; bilgisayarın tarihine bağlı değildir.
// Listede olmayan/eşleşmeyen araçların önceki fiyatı korunur (rapor edilir).
import { writeFileSync } from 'node:fs';
import { VEHICLES } from '../src/data/vehicles.ts';
import { MONTHLY_PRICES } from '../src/data/monthlyPrices.ts';

const SOURCES = {
  dh: 'https://www.donanimhaber.com/elektrikli-araba-fiyatlari--159687',
  he: 'https://hibritelektrik.com/elektrikli-arac-fiyat-listesi',
};
const OUT = 'src/data/monthlyPrices.ts';
const BASE_MONTH = '2026-09';
const dry = process.argv.includes('--dry');
const force = process.argv.includes('--force');
const MAX_CHANGE = 0.4;

const MONTHS_TR = { ocak: 1, subat: 2, mart: 3, nisan: 4, mayis: 5, haziran: 6, temmuz: 7, agustos: 8, eylul: 9, ekim: 10, kasim: 11, aralik: 12 };

const norm = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').toLowerCase()
    .replace(/long range/g, 'uzun menzil').replace(/standard range|standart range/g, 'standart menzil')
    .replace(/(\d)\s*kw\b/g, '$1 kw').replace(/(\d)\s*(hp|ps)\b/g, '$1$2')
    .replace(/[^a-z0-9]+/g, ' ').trim();

const STOP = new Set(['elektrikli', 'elektrik', 'motor', 'bev', 'tl', 'the', 'agustos']);
const tokens = (s) => new Set(norm(s).split(' ').filter((t) => t && !STOP.has(t)));

/** Tabloda markasız / farklı yazılan satırlar için düzeltmeler. */
const REWRITE = [
  [/^R5 /i, 'Renault 5 '],
  [/^Megane /i, 'Renault Megane '],
  [/^Scenic /i, 'Renault Scenic '],
  [/^e-C3 /i, 'Citroen e-C3 '],
  [/^e-C4 /i, 'Citroen e-C4 '],
  [/^e-C5 /i, 'Citroen e-C5 '],
  [/^Ami /i, 'Citroen Ami '],
  [/^TOPOL[İI]NO /i, 'Fiat Topolino '],
  // Tablodaki yazım hataları / farklı adlandırmalar
  [/^BMW (i5)(eDrive40|xDrive40)/i, 'BMW $1 $2'],
  [/^BMW iX M70 xDrive60 M$/i, 'BMW iX M70 xDrive'],
  [/^BMW i7 M70( xDrive M)?$/i, 'BMW i7 M70 xDrive'],
  [/^Yeni /i, ''],
];

const get = async (url) => (await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (evrova price updater)' } })).text();
const clean = (h) => h.replace(/<img[^>]*>/g, '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const toPrice = (s) => {
  const m = s.match(/([\d.]{5,})\s*(TL|₺)/);
  return m ? Number(m[1].replace(/\./g, '')) : null;
};

// ---- Kaynak 1: DonanımHaber -------------------------------------------------
const dhHtml = await get(SOURCES.dh);
const cap = dhHtml.match(/<caption>[\s\S]*?\(([A-Za-zÇĞİÖŞÜçğıöşü]+)\s+(\d{4})\)[\s\S]*?<\/caption>/);
if (!cap) throw new Error('DonanımHaber tablo başlığından ay okunamadı (sayfa yapısı değişmiş olabilir).');
const monthNo = MONTHS_TR[norm(cap[1]).replace(/ /g, '')];
if (!monthNo) throw new Error(`Bilinmeyen ay adı: ${cap[1]}`);
const ym = `${cap[2]}-${String(monthNo).padStart(2, '0')}`;

const dhRows = [...dhHtml.slice(dhHtml.indexOf('<table'), dhHtml.indexOf('</table>')).matchAll(/<tr>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<\/tr>/g)]
  .map((m) => ({ name: clean(m[1]), price: toPrice(m[2]), src: 'dh' }));
if (dhRows.length < 30) throw new Error(`DonanımHaber: beklenenden az satır (${dhRows.length}); sayfa yapısı değişmiş olabilir.`);

// ---- Kaynak 2: hibritelektrik.com (hata verirse atlanır) --------------------
let heRows = [];
try {
  const h = await get(SOURCES.he);
  const t = h.slice(h.indexOf('<table'), h.indexOf('</table>'));
  heRows = [...t.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].slice(1).map((r) => {
    const cells = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => clean(c[1]));
    return { name: cells[1] ?? '', price: toPrice(cells[2] ?? ''), src: 'he' };
  }).filter((r) => r.name);
} catch (e) {
  console.log(`⚠ hibritelektrik.com okunamadı (${e.message}); yalnızca DonanımHaber kullanılacak.`);
}

// ---- Eşleştirme -------------------------------------------------------------
const cands = VEHICLES.map((v) => ({ v, t: tokens(`${v.brand} ${v.model} ${v.trim ?? ''}`) }));
const matched = new Map();

/** skor = araç kelimelerinin satırda bulunma oranı (öncelikli) + satırın araçta bulunma oranı; bire bir atama. */
function matchRows(rows, pool) {
  const pairs = [];
  rows.forEach((r, ri) => {
    if (r.price == null) return;
    let name = r.name;
    for (const [re, to] of REWRITE) name = name.replace(re, to);
    const rt = tokens(name);
    for (const c of pool) {
      const inter = [...c.t].filter((t) => rt.has(t)).length;
      if (!inter) continue;
      const score = 0.7 * (inter / c.t.size) + 0.3 * (inter / rt.size);
      if (score >= 0.72) pairs.push({ ri, id: c.v.id, score });
    }
  });
  pairs.sort((a, b) => b.score - a.score);
  const usedRow = new Set(), usedVeh = new Set();
  for (const p of pairs) {
    if (usedRow.has(p.ri) || usedVeh.has(p.id)) continue;
    usedRow.add(p.ri); usedVeh.add(p.id);
    matched.set(p.id, { price: rows[p.ri].price, row: rows[p.ri].name, src: rows[p.ri].src });
  }
  return rows.filter((r, i) => r.price != null && !usedRow.has(i));
}

const dhLeft = matchRows(dhRows, cands);
// hibritelektrik yalnızca DonanımHaber'de bulunmayan araçlar için kullanılır
matchRows(heRows, cands.filter((c) => !matched.has(c.v.id)));

// ---- Fiyat değişimi kontrolü ------------------------------------------------
const prevPrice = (id) => VEHICLES.find((v) => v.id === id).prices[11];
const next = {};
const changes = [], suspicious = [];
for (const [id, m] of matched) {
  const prev = prevPrice(id);
  const ratio = m.price / prev - 1;
  if (!force && Math.abs(ratio) > MAX_CHANGE) { suspicious.push({ id, prev, now: m.price, row: m.row }); continue; }
  next[id] = m.price;
  if (m.price !== prev) changes.push({ id, prev, now: m.price, pct: ratio * 100, src: m.src });
}
const unmatchedVehicles = VEHICLES.filter((v) => !matched.has(v.id)).map((v) => v.id);
const bySrc = (s) => [...matched.values()].filter((m) => m.src === s).length;

console.log(`Liste ayı: ${ym}  ·  DonanımHaber: ${dhRows.length} satır, ${bySrc('dh')} eşleşti  ·  hibritelektrik: ${heRows.length} satır, ${bySrc('he')} ek eşleşti`);
console.log(`Toplam eşleşen: ${matched.size}/${VEHICLES.length}  ·  fiyatı değişen: ${changes.length}  ·  değişmeyen: ${Object.keys(next).length - changes.length}`);
for (const c of changes.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct)).slice(0, 15))
  console.log(`  ${c.id.padEnd(46)} ${c.prev.toLocaleString('tr-TR')} -> ${c.now.toLocaleString('tr-TR')}  (${c.pct >= 0 ? '+' : ''}${c.pct.toFixed(1)}%) [${c.src}]`);
if (changes.length > 15) console.log(`  … ve ${changes.length - 15} değişiklik daha`);
if (suspicious.length) {
  console.log(`\n⚠ %${MAX_CHANGE * 100}'ten fazla değişen (yazılmadı; doğruysa --force):`);
  for (const s of suspicious) console.log(`  ${s.id}: ${s.prev} -> ${s.now}  [satır: ${s.row}]`);
}
if (dhLeft.length) console.log(`\nDonanımHaber'de eşleşmeyen satırlar (${dhLeft.length}) — yeni model/paket olabilir:\n  ${dhLeft.map((r) => `${r.name} (${r.price.toLocaleString('tr-TR')} TL)`).join('\n  ')}`);
if (unmatchedVehicles.length) console.log(`\nİki listede de bulunamayan araçlar (${unmatchedVehicles.length}) — önceki fiyatı korunur:\n  ${unmatchedVehicles.join(', ')}`);

if (dry) { console.log('\n(--dry: dosya yazılmadı)'); process.exit(0); }
if (ym <= BASE_MONTH) { console.log(`\nBu ay uygulamanın taban ayı (${BASE_MONTH}) veya öncesi; yazılmadı.`); process.exit(0); }

const merged = { ...MONTHLY_PRICES, [ym]: { ...(MONTHLY_PRICES[ym] ?? {}), ...next } };
if (JSON.stringify(merged[ym]) === JSON.stringify(MONTHLY_PRICES[ym])) { console.log('\nDeğişiklik yok, dosya güncellenmedi.'); process.exit(0); }

const body = Object.keys(merged).sort().map((m) =>
  `  '${m}': {\n${Object.entries(merged[m]).sort(([a], [b]) => a.localeCompare(b)).map(([id, p]) => `    '${id}': ${p},`).join('\n')}\n  },`).join('\n');
writeFileSync(OUT,
  `// OTOMATİK ÜRETİLİR: scripts/update-prices.mjs (her ayın ilk haftası listelerden okunur). Elle düzenleme.\n` +
  `// Anahtar: "YYYY-MM" -> { araç id -> liste fiyatı (TL) }. Bir araç o ayın listesinde yoksa önceki fiyatı korunur.\n` +
  `export const MONTHLY_PRICES: Record<string, Record<string, number>> = {\n${body}\n};\n`);
console.log(`\n✔ ${OUT} güncellendi (${ym}: ${Object.keys(merged[ym]).length} araç).`);
