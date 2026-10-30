// OpenStreetMap'ten (Overpass API) Türkiye'deki şarj istasyonlarını çeker ve uygulamanın kullandığı listeyi üretir.
//   node scripts/fetch-chargers.mjs            -> data/chargers.json + src/data/chargerData.ts
//   node scripts/fetch-chargers.mjs --offline  -> yalnızca data/chargers.json'dan chargerData.ts'i yeniden üretir
//   node scripts/fetch-chargers.mjs --places   -> il/ilçesi bilinmeyen istasyonları Nominatim'den bulur (saniyede 1 istek; sonuçlar data/charger-places.json'da önbelleklenir)
// Veri © OpenStreetMap katkıcıları, ODbL lisanslıdır; uygulamada atıf gösterilir.
// Kapsam OSM'deki kayıtlarla sınırlıdır; eksik/yanlış istasyonlar OSM'de düzeltilince bir sonraki çalıştırmada gelir.
// Elle eklenen/düzeltilen kayıtlar data/chargers-extra.json'a yazılır (aynı id ile OSM kaydının üzerine yazar).
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const JSON_OUT = 'data/chargers.json';
const EXTRA = 'data/chargers-extra.json';
const PLACES = 'data/charger-places.json';
const TS_OUT = 'src/data/chargerData.ts';
const QUERY = '[out:json][timeout:120];area["ISO3166-1"="TR"][admin_level=2]->.a;(node["amenity"="charging_station"](area.a);way["amenity"="charging_station"](area.a););out center tags;';

// İşletmeci yazım varyantları -> tek ad
const OPERATORS = {
  sharz: 'Sharz', zes: 'ZES', esarj: 'Eşarj', 'astor enerji': 'Astor Enerji', tesla: 'Tesla', 'tesla, inc.': 'Tesla', 'tesla inc': 'Tesla',
  voltrun: 'Voltrun', trugo: 'Trugo', togg: 'Togg', 'wat mobilite': 'WAT Mobilite', renault: 'Renault', otojet: 'Otojet',
  'shell recharge': 'Shell Recharge', shell: 'Shell Recharge', 'zeplin enerji': 'Zeplin Enerji', 'en yakit': 'En Yakıt', ovolt: 'Ovolt',
  'tuncmatik': 'Tunçmatik', 'neva sarj': 'Neva Şarj', 'd-charge': 'D-Charge', 'd charge': 'D-Charge',
};
const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').toLowerCase().trim();
const operatorOf = (t) => {
  const raw = (t.operator || t.brand || t.network || '').trim();
  if (!raw) return '';
  return OPERATORS[fold(raw)] ?? raw;
};

const num = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : 0; };
const count = (v) => { const n = parseInt(v, 10); return Number.isFinite(n) && n > 0 ? n : 1; };

function normalize(el) {
  const t = el.tags ?? {};
  const lat = el.lat ?? el.center?.lat, lon = el.lon ?? el.center?.lon;
  if (lat == null || lon == null) return null;
  if (['private', 'no'].includes(t.access)) return null;

  const sockets = {};
  let kw = 0;
  const add = (key, n) => { if (n) sockets[key] = (sockets[key] ?? 0) + n; };
  add('ccs', t['socket:type2_combo'] ? count(t['socket:type2_combo']) : 0);
  add('ccs', t['socket:type1_combo'] ? count(t['socket:type1_combo']) : 0);
  add('chademo', t['socket:chademo'] ? count(t['socket:chademo']) : 0);
  add('type2', t['socket:type2'] ? count(t['socket:type2']) : 0);
  add('type1', t['socket:type1'] ? count(t['socket:type1']) : 0);
  const teslaKey = Object.keys(t).find((k) => /^socket:tesla/.test(k) && !k.includes(':output'));
  add('tesla', teslaKey ? count(t[teslaKey]) : 0);
  for (const k of Object.keys(t)) if (k.startsWith('socket:') && k.endsWith(':output')) kw = Math.max(kw, num(t[k]));

  const operator = operatorOf(t);
  if (!Object.keys(sockets).length && t.bicycle === 'yes') return null; // e-bisiklet şarjı
  const dc = !!(sockets.ccs || sockets.chademo || sockets.tesla) && (kw === 0 || kw >= 20);
  const city = t['addr:province'] || t['addr:city'] || '';
  const district = t['addr:district'] || '';
  const name = (t.name || t.short_name || [operator, city].filter(Boolean).join(' ') || 'Şarj noktası').trim();
  const out = { id: `${el.type[0]}${el.id}`, name, operator, lat: +lat.toFixed(6), lon: +lon.toFixed(6), sockets, dc };
  if (kw) out.kw = kw;
  if (city) out.city = city;
  if (district) out.district = district;
  if (t.fee === 'yes') out.fee = true; else if (t.fee === 'no') out.fee = false;
  if (t.opening_hours) out.hours = t.opening_hours;
  return out;
}

async function fetchAll() {
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'User-Agent': 'Evrova-app/1.0 (EV charging list build script)', Accept: '*/*', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(QUERY),
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  return (await res.json()).elements;
}

let list;
if (process.argv.includes('--offline')) {
  list = JSON.parse(readFileSync(JSON_OUT, 'utf8'));
} else {
  const items = (await fetchAll()).map(normalize).filter(Boolean);
  // Aynı noktadaki (≈10 m) tekrarları birleştir: işletmecisi/adı dolu olan kalır.
  const seen = new Map();
  for (const c of items) {
    const key = `${c.lat.toFixed(4)},${c.lon.toFixed(4)}`;
    const prev = seen.get(key);
    if (!prev || (!prev.operator && c.operator) || Object.keys(c.sockets).length > Object.keys(prev.sockets).length) seen.set(key, c);
  }
  list = [...seen.values()];
  writeFileSync(JSON_OUT, JSON.stringify(list));
}
// İl/ilçe: önce OSM'deki adres etiketi, yoksa Nominatim önbelleği (--places ile doldurulur).
const places = existsSync(PLACES) ? JSON.parse(readFileSync(PLACES, 'utf8')) : {};
if (process.argv.includes('--places')) {
  const todo = list.filter((c) => !places[c.id]);
  console.log(`${todo.length} istasyonun il/ilçesi aranacak (~${Math.ceil(todo.length * 1.1 / 60)} dk).`);
  let n = 0;
  for (const c of todo) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=12&addressdetails=1&accept-language=tr&lat=${c.lat}&lon=${c.lon}`, {
        headers: { 'User-Agent': 'Evrova-app/1.0 (EV charging list build script)' },
      });
      if (res.ok) {
        const a = (await res.json()).address ?? {};
        const province = (a.province || a.state || '').replace(/ (Province|İli)$/i, '');
        const district = a.town || a.county || a.city_district || (a.city && a.city !== province ? a.city : '') || '';
        places[c.id] = { province, district };
      }
    } catch { /* bir sonraki çalıştırmada tekrar denenir */ }
    if (++n % 25 === 0) { writeFileSync(PLACES, JSON.stringify(places)); console.log(`${n}/${todo.length}`); }
    await new Promise((r) => setTimeout(r, 1100));
  }
  writeFileSync(PLACES, JSON.stringify(places));
}
for (const c of list) {
  const p = places[c.id];
  if (!p) continue;
  if (p.province) c.city = p.province;
  if (p.district) c.district = p.district;
}
if (existsSync(EXTRA)) {
  const byId = new Map(list.map((c) => [c.id, c]));
  for (const c of JSON.parse(readFileSync(EXTRA, 'utf8'))) byId.set(c.id, c);
  list = [...byId.values()];
}
list.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
writeFileSync(
  TS_OUT,
  `// OTOMATİK ÜRETİLDİ: scripts/fetch-chargers.mjs (kaynak: OpenStreetMap, ODbL). Elle düzenleme.\nimport type { Charger } from '../types';\n\nexport const CHARGERS: Charger[] = ${JSON.stringify(list)};\n`,
);
console.log(`${list.length} istasyon yazıldı (DC: ${list.filter((c) => c.dc).length}).`);
