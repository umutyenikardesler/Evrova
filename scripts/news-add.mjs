// Yeni haberleri data/news-items.json dosyasına ekler (36 saatte bir çalışan zamanlanmış görev bunu kullanır).
//
//   node scripts/news-add.mjs <yeni-haberler.json>       -> doğrular, ekler, görselleri indirir, newsData.ts'i üretir
//   node scripts/news-add.mjs <yeni-haberler.json> --dry -> yalnızca doğrular
//   node scripts/news-add.mjs --due                      -> son çalışmadan beri 36 saat geçti mi? (çıkış kodu 0 = evet, 1 = hayır)
//
// Girdi dosyası: [{ cat, published: "YYYY-MM-DD", readMin?, source: {name, url}, images: ["Commons dosya adı.jpg", ...],
//                  title: {tr, en}, body: {tr: [paragraf, ...], en: [paragraf, ...]} }, ...]
// Kurallar: kategori NEWS_CATS'tan biri; kaynak URL'si ve başlık daha önce eklenmemiş olmalı; her haberin en az bir görseli,
// TR+EN başlığı ve 2+ paragrafı olmalı. Hatalı kayıt reddedilir (diğerleri eklenir). 120 günden eski haberler listeden çıkarılır.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { buildNews } from './news-build.mjs';

const ITEMS = 'data/news-items.json';
const STATE = 'data/news-state.json';
const CATS = ['battery', 'charging', 'moto', 'software', 'commercial'];
const MAX_AGE_DAYS = 120;
const INTERVAL_H = 36;
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const read = (p, fb) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return fb; } };

if (args.includes('--due')) {
  const last = Date.parse(read(STATE, {}).lastRun ?? 0);
  const hours = (Date.now() - last) / 36e5;
  console.log(`Son çalışma: ${Number.isFinite(last) ? new Date(last).toISOString() : 'yok'} (${hours.toFixed(1)} saat önce); eşik ${INTERVAL_H} saat.`);
  process.exit(hours >= INTERVAL_H ? 0 : 1);
}

const file = args.find((a) => !a.startsWith('--'));
if (!file) { console.error('Kullanım: node scripts/news-add.mjs <yeni-haberler.json> [--dry]'); process.exit(2); }

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const items = read(ITEMS, []);
const incoming = read(file, null);
if (!Array.isArray(incoming)) { console.error('Girdi bir dizi olmalı.'); process.exit(2); }

const seenUrl = new Set(items.map((n) => n.source?.url));
const seenTitle = new Set(items.map((n) => norm(n.title.tr)));
let nextId = items.reduce((m, n) => Math.max(m, Number(n.id.slice(1)) || 0), 0) + 1;
const added = [], rejected = [];

for (const n of incoming) {
  const why = [];
  if (!CATS.includes(n.cat)) why.push(`kategori geçersiz (${n.cat})`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(n.published ?? '')) why.push('published YYYY-MM-DD olmalı');
  if (!n.source?.url?.startsWith('http') || !n.source?.name) why.push('kaynak (name + url) eksik');
  if (!n.title?.tr || !n.title?.en) why.push('TR/EN başlık eksik');
  for (const l of ['tr', 'en']) if (!Array.isArray(n.body?.[l]) || n.body[l].length < 2) why.push(`${l} gövde en az 2 paragraf olmalı`);
  if (!n.images?.length) why.push('en az bir görsel (Commons dosya adı) gerekli');
  if (seenUrl.has(n.source?.url)) why.push('bu kaynak zaten eklenmiş');
  if (n.title?.tr && seenTitle.has(norm(n.title.tr))) why.push('aynı başlık zaten var');
  if (why.length) { rejected.push({ title: n.title?.tr ?? '(başlıksız)', why }); continue; }
  const words = (n.body.tr.join(' ').split(/\s+/).length);
  const item = {
    id: `n${nextId++}`, cat: n.cat, published: n.published, readMin: n.readMin ?? Math.max(2, Math.round(words / 160)),
    source: n.source, images: n.images, title: n.title, body: n.body,
  };
  seenUrl.add(item.source.url); seenTitle.add(norm(item.title.tr));
  added.push(item);
}

const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 864e5).toISOString().slice(0, 10);
const kept = [...added, ...items].filter((n) => n.published >= cutoff);
const pruned = items.length + added.length - kept.length;

console.log(`Eklenecek: ${added.length}  ·  reddedilen: ${rejected.length}  ·  ${MAX_AGE_DAYS} günden eski çıkarılan: ${pruned}`);
for (const a of added) console.log(`  + ${a.id} [${a.cat}] ${a.published}  ${a.title.tr}`);
for (const r of rejected) console.log(`  ✗ ${r.title}\n      ${r.why.join('; ')}`);
if (dry) { console.log('(--dry: dosyalar yazılmadı)'); process.exit(0); }

writeFileSync(ITEMS, JSON.stringify(kept, null, 2) + '\n');
writeFileSync(STATE, JSON.stringify({ lastRun: new Date().toISOString(), lastAdded: added.map((a) => a.id), note: 'Haber tarayıcı görevi son çalışma zamanı (36 saat kuralı için).' }, null, 2) + '\n');
const r = spawnSync(process.execPath, ['scripts/fetch-news-images.mjs'], { stdio: 'inherit' });
console.log(`${buildNews()} haber -> src/data/newsData.ts`);
if (r.status !== 0) { console.error('Görsel indirme başarısız oldu; haberler eklendi ama görseller eksik olabilir.'); process.exit(1); }
