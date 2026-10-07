import type { Spec, Vehicle, VehicleType } from '../types.ts';
import { MONTHLY_PRICES } from './monthlyPrices.ts';

/**
 * Türkiye'de satılan elektrikli araçlar (marka > model > paket/versiyon).
 *
 * KAYNAKLAR (fiyatlar liste fiyatıdır, opsiyonlar hariç):
 *  - Otomobiller: DonanımHaber "Türkiye'de satılan elektrikli otomobil fiyatları" (21 Eylül 2026).
 *  - "(Ağustos)" işaretli satırlar: hibritelektrik.com listesi (27 Ağustos 2026).
 *  - Togg ve Tesla ayrıca gzt.com / teknoblog Eylül 2026 listeleriyle doğrulandı.
 *  - Ford ticari: Gürbaşlar Ford, Tanoto; Horwin: Motoron (5 Nisan 2026).
 *  Fiyatı listelenmeyen versiyonlar eklenmemiştir.
 *
 * Menzil (WLTP), batarya ve güç yalnızca kaynaklarda bulunduğunda girilmiştir; yoksa boştur.
 *
 * FİYAT GEÇMİŞİ: Satırlardaki fiyat BASE_MONTH (Eylül 2026) listesidir. Sonraki aylar
 * src/data/monthlyPrices.ts içindedir ve her ayın ilk haftasında `npm run prices` (scripts/update-prices.mjs)
 * ile DonanımHaber listesinden otomatik eklenir. 12 aylık seri, son listeden (LIST_MONTH) geriye doğru kurulur:
 *  - gerçek (kaydedilmiş) aylar gerçek fiyatla,
 *  - bir ayın listesinde olmayan araç önceki fiyatını korur,
 *  - kayıtlı ilk aydan ÖNCEKİ aylar gerçek değildir: kimlikten üretilen sabit bir simülasyondur
 *    (aylar geçtikçe simülasyon dışarı kayar, seri tamamen gerçek veriye döner).
 */

/** Satırlardaki fiyatların ait olduğu liste ayı. */
const BASE_MONTH = '2026-09';
/** Elimizdeki en yeni liste ayı. */
export const LIST_MONTH: string = [BASE_MONTH, ...Object.keys(MONTHLY_PRICES)].sort().pop()!;

const monthIndex = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return y * 12 + (m - 1);
};

/** 12 aylık seri (son ay = LIST_MONTH). */
function priceSeries(id: string, basePrice: number): number[] {
  const known = new Map<number, number>([[monthIndex(BASE_MONTH), basePrice]]);
  for (const [ym, prices] of Object.entries(MONTHLY_PRICES)) if (prices[id] != null) known.set(monthIndex(ym), prices[id]);
  const knownIdx = [...known.keys()].sort((a, b) => a - b);
  const first = knownIdx[0];
  const sim = history(id, known.get(first)!); // sim[11] = ilk kayıtlı ay
  const end = monthIndex(LIST_MONTH);
  return Array.from({ length: 12 }, (_, k) => {
    const m = end - 11 + k;
    if (m < first) return sim[Math.max(0, 11 - (first - m))];
    const last = [...knownIdx].reverse().find((i) => i <= m)!; // o aya kadarki son gerçek fiyat
    return known.get(last)!;
  });
}

/** Deterministik sözde-rastgele: aynı id her zaman aynı seriyi üretir. */
function history(id: string, current: number): number[] {
  let seed = 0;
  for (const ch of id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const out = [current];
  let p = current;
  for (let i = 0; i < 11; i++) {
    p = p / (1 + (rnd() * 5 - 1.6) / 100); // aylık ~ -1,6% ... +3,4%
    out.unshift(Math.round(p / 1000) * 1000);
  }
  return out;
}

const spec = (tr: string, en: string, value: string | [string, string]): Spec => ({
  label: { tr, en },
  value: typeof value === 'string' ? { tr: value, en: value } : { tr: value[0], en: value[1] },
});
const num = (n: number): [string, string] => {
  const d = n % 1 ? 1 : 0;
  return [n.toFixed(d).replace('.', ','), n.toFixed(d)];
};

const slug = (s: string) =>
  s.toLowerCase().replace(/[ıİ]/g, 'i').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ö/g, 'o').replace(/ş/g, 's')
    .replace(/[üû]/g, 'u').replace(/[éë]/g, 'e').replace(/š/g, 's').replace(/\+/g, 'plus').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Paket adındaki yaygın Türkçe ifadelerin İngilizcesi. */
const EN_WORDS: [string, string][] = [
  ['Standart Menzil', 'Standard Range'], ['Uzun Menzil', 'Long Range'], ['Arkadan Çekiş', 'RWD'],
  ['Dört Çeker', 'AWD'], ['koltuk', 'seats'], ['Elektrik', 'Electric'],
];
const toEn = (s: string) => EN_WORDS.reduce((acc, [tr, en]) => acc.replace(tr, en), s);

interface Extra {
  id?: string;
  range?: number; // WLTP km
  kwh?: number;
  kw?: number;
  specs?: Spec[];
}
type Row = [model: string, trim: string, price: number, extra?: Extra];

function build(type: VehicleType, brand: string, rows: Row[]): Vehicle[] {
  return rows.map(([model, trim, price, x = {}]) => {
    const name = `${brand} ${model} ${trim}`.trim();
    const id = x.id ?? slug(name);
    const specs: Spec[] = [];
    if (x.range) specs.push(spec('Menzil (WLTP)', 'Range (WLTP)', `${x.range} km`));
    if (x.kwh) specs.push(spec('Batarya', 'Battery', [`${num(x.kwh)[0]} kWh`, `${num(x.kwh)[1]} kWh`]));
    if (x.kw) specs.push(spec('Motor gücü', 'Motor power', [`${num(x.kw)[0]} kW`, `${num(x.kw)[1]} kW`]));
    specs.push(...(x.specs ?? []));
    return {
      id, type, brand, model, trim, name, tagline: { tr: trim || model, en: toEn(trim || model) },
      rangeKm: x.range, batteryKwh: x.kwh, prices: priceSeries(id, price), listMonth: LIST_MONTH, specs,
    };
  });
}

const cars = (brand: string, rows: Row[]) => build('car', brand, rows);

const CARS: Vehicle[] = [
  ...cars('Togg', [
    ['T10X', 'V1 RWD Standart Menzil', 1909048, { id: 'togg-t10x-std', kwh: 52.4, range: 314, kw: 160 }],
    ['T10X', 'V1 RWD Uzun Menzil', 2219668, { kwh: 88.5, range: 523, kw: 160 }],
    ['T10X', 'V2 RWD Uzun Menzil', 2411000, { kwh: 88.5, range: 523, kw: 160 }],
    ['T10X', 'V2 4More Obsidiyen', 3218137, { kwh: 88.5, kw: 320 }],
    ['T10F', 'V1 RWD Standart Menzil', 1884980, { kwh: 52.4, range: 335, kw: 160 }],
    ['T10F', 'V1 RWD Uzun Menzil', 2195600, { kwh: 88.5, range: 623, kw: 160 }],
    ['T10F', 'V2 RWD Uzun Menzil', 2370930, { kwh: 88.5, range: 623, kw: 160 }],
    ['T10F', 'V2 4More', 3217937, { kwh: 88.5, kw: 320 }],
  ]),
  ...cars('Tesla', [
    ['Model Y', 'Standart Menzil Arkadan Çekiş', 2474985, { id: 'tesla-model-y', range: 534 }],
    ['Model Y', 'Premium Uzun Menzil Arkadan Çekiş', 3682800, { range: 622 }],
    ['Model Y', 'Premium Uzun Menzil Dört Çeker', 4410000, { kwh: 79, range: 551 }],
    ['Model Y', 'Performance Dört Çeker', 4756000],
  ]),
  ...cars('Renault', [
    ['5 E-Tech', 'EV52 150hp', 2099000, { kwh: 52, range: 410 }],
    ['Megane E-Tech', 'EV60 220hp', 2386000, { kwh: 60, range: 450 }],
    ['Scenic E-Tech', 'EV87 220hp Esprit Alpine', 3490000, { kwh: 87, range: 604 }],
  ]),
  ...cars('Citroën', [
    ['ë-C3', '83 kW Plus', 1640000, { kwh: 44, range: 320, kw: 83 }],
    ['ë-C3', '83 kW Max', 1720000, { kwh: 44, range: 320, kw: 83 }],
    ['ë-C3 Aircross', '83 kW Max Standart Menzil', 1855000, { kw: 83 }],
    ['ë-C3 Aircross', '83 kW Collection Uzun Menzil', 1970000, { kw: 83 }],
    ['ë-C3 Aircross', '83 kW Max Uzun Menzil', 2000000, { kw: 83 }],
    ['ë-C4', '115 kW Max', 2375000, { kw: 115 }],
    ['ë-C4 X', '115 kW Max', 2340000, { kw: 115 }],
    ['ë-C5 Aircross', '157 kW Plus', 2430000, { kw: 157 }],
    ['Ami', '6 kW', 600000, { kw: 6, range: 75 }],
    ['Ami', 'Dark Side 6 kW', 615000, { kw: 6, range: 75 }],
    ['Ami', 'Sunrise 6 kW', 640000, { kw: 6, range: 75 }],
    ['Ami', 'Sunset 6 kW', 640000, { kw: 6, range: 75 }],
  ]),
  ...cars('Opel', [
    ['Corsa-e', '100 kW GS', 1890000, { kw: 100 }],
    ['Frontera', 'Elektrik 100 kW GS', 1895000, { kw: 100 }],
    ['Frontera', 'Elektrik 100 kW GS Uzun Menzil', 2010000, { kw: 100 }],
    ['Grandland', 'Elektrik 157 kW Edition', 3200000, { kw: 157 }],
    ['Grandland', 'Elektrik 157 kW GS', 4220000, { kw: 157 }],
  ]),
  ...cars('Peugeot', [
    ['e-208', 'GT 100 kW', 2080000, { kw: 100 }],
    ['e-2008', 'Allure 115 kW', 2245000, { kw: 115 }],
    ['e-2008', 'GT 115 kW', 2400000, { kw: 115 }],
    ['E-3008', 'Allure 157 kW', 3384500, { kw: 157 }],
    ['E-3008', 'GT 157 kW', 3585000, { kw: 157 }],
    ['E-5008', 'Allure 157 kW', 3573500, { kw: 157 }],
    ['E-5008', 'GT 157 kW', 3717000, { kw: 157 }],
  ]),
  ...cars('Ford', [
    ['Puma Gen-E', '125 kW', 2158700, { kw: 125 }],
    ['Explorer BEV', '125 kW Select', 2232300, { kw: 125 }],
    ['Explorer BEV', '140 kW Select', 2298900, { kw: 140 }],
    ['Explorer BEV', '125 kW Premium', 2457300, { kw: 125 }],
    ['Explorer BEV', '140 kW Premium', 3104800, { kw: 140 }],
    ['Explorer BEV', '250 kW Premium', 4217200, { kw: 250 }],
    ['Capri', 'Premium 125 kW', 3211600, { kw: 125 }],
    ['Capri', 'Premium 140 kW', 3371600, { kw: 140 }],
    ['Capri', 'Premium 250 kW', 4330000, { kw: 250 }],
    ['Mustang Mach-E', 'Standard Range RWD 71 kWh (Ağustos)', 3400000, { kwh: 71, range: 440 }],
  ]),
  ...cars('Hyundai', [
    ['INSTER', 'Dynamic 71,1 kW', 1595000, { kwh: 42, range: 327, kw: 71.1 }],
    ['INSTER', 'Advance 84,5 kW', 1845000, { kw: 84.5 }],
    ['INSTER Cross', 'Advance 84,5 kW', 1840000, { kw: 84.5 }],
    ['KONA Electric', 'Advance 115 kW', 2450000, { kwh: 65.4, range: 454, kw: 115 }],
    ['IONIQ 5', 'Dynamic Vision Roof 125 kW 4x2', 3150000, { kw: 125 }],
    ['IONIQ 5', 'Advance 160 kW', 3490000, { kw: 160 }],
    ['IONIQ 5 N', 'Advance 448 kW 4x4', 6205000, { kw: 448 }],
    ['IONIQ 6', 'Advance 125 kW Standart Menzil', 3225000, { kw: 125 }],
    ['IONIQ 6', 'Progressive 160 kW Uzun Menzil', 3770000, { kw: 160 }],
    ['IONIQ 9', 'Progressive 160 kW 4x2', 5930000, { kw: 160 }],
    ['IONIQ 9', 'Calligraphy 226,1 kW 4x4', 7080000, { kw: 226.1 }],
  ]),
  ...cars('Kia', [
    ['EV2', 'Cool 107,8 kW', 1719000, { kw: 107.8 }],
    ['EV2', 'Elegance 107,8 kW', 1919000, { kw: 107.8 }],
    ['EV2', 'Elegance 99,5 kW Uzun Menzil', 2129000, { kw: 99.5 }],
    ['EV3', 'Elegance Comfort 150 kW', 2399000, { kw: 150 }],
    ['EV3', 'Cool 150 kW Uzun Menzil', 2450000, { kwh: 81.4, range: 600, kw: 150 }],
    ['EV3', 'Elegance 150 kW Uzun Menzil', 2485000, { kwh: 81.4, range: 600, kw: 150 }],
    ['EV3', 'Prestige 150 kW', 2485000, { kw: 150 }],
    ['EV3', 'GT-Line 150 kW Uzun Menzil', 3760000, { kwh: 81.4, range: 600, kw: 150 }],
    ['Niro EV', 'Elegance 150 kW', 2299000, { kw: 150 }],
    ['EV6', 'Long Range AWD (Ağustos)', 3299000, { kwh: 77.4, range: 484 }],
    ['EV6', 'Elegance Standart Menzil 125 kW 4x2', 3790000, { range: 428, kw: 125 }],
    ['EV9', 'Prestige 149 kW 7 koltuk', 6540000, { kw: 149 }],
    ['EV9', 'GT-Line 283 kW 4x4 6 koltuk', 7870000, { kw: 283 }],
    ['EV9', 'GT-Line 283 kW 4x4 7 koltuk', 7870000, { kw: 283 }],
  ]),
  ...cars('Škoda', [
    ['Elroq 60', 'e-Prestige 204 PS', 3314900],
    ['Enyaq 60', 'e-Prestige 204 PS', 3999900],
    ['Enyaq Coupé 60', 'e-Sportline 204 PS', 4099900],
    ['Enyaq Coupé', 'e-RS 340 PS 4x4', 5499900],
  ]),
  ...cars('Fiat', [
    ['Grande Panda', 'La Prima 44 kWh', 1544900, { kwh: 44, range: 320 }],
    ['600e', 'La Prima', 1989900, { kwh: 54, range: 409 }],
    ['500e', 'Icon 42 kWh (Ağustos)', 2249900, { kwh: 42, range: 320 }],
    ['500e', 'Giorgio Armani 42 kWh', 2379900, { kwh: 42, range: 320 }],
    ['Topolino', '6 kW', 629900, { kwh: 5.5, kw: 6 }],
    ['Topolino', 'Plus 6 kW', 654900, { kwh: 5.5, kw: 6 }],
  ]),
  ...cars('Volkswagen', [
    ['ID.3', 'Pro S 77 kWh (Ağustos)', 1899000, { kwh: 77, range: 560 }],
    ['ID.4', '125 kW 170 PS', 3126000, { kw: 125 }],
    ['ID.7', '210 kW 286 PS', 4415000, { kw: 210 }],
  ]),
  ...cars('BMW', [
    ['iX1', 'eDrive20 Sport Line', 4261800],
    ['iX1', 'eDrive20 X-Line', 4486000],
    ['iX1', 'eDrive20 M Sport', 4654200],
    ['iX2', 'eDrive20 M Sport', 4699900],
    ['i4', 'eDrive40 Sport Line', 5630700, { kwh: 80.7 }],
    ['i4', 'eDrive40 M Sport', 6230400, { kwh: 80.7 }],
    ['i4', 'eDrive40 Edition M Sport', 6861100, { kwh: 80.7 }],
    ['iX3', '50 xDrive M Sport', 6819500, { kwh: 108.7, range: 805 }],
    ['i5', 'eDrive40 M Sport', 7842600],
    ['i5', 'eDrive40 Edition M Sport', 8048700],
    ['i5', 'xDrive40 M Sport', 8403100],
    ['i5', 'xDrive40 Edition M Sport', 8831700],
    ['i5', 'M60 xDrive', 10360800],
    ['i5', 'M60 xDrive Touring', 10424700],
    ['iX', 'xDrive60 M Sport', 10783400],
    ['iX', 'M70 xDrive', 11504200],
    ['iX', 'xDrive60 Pure Excellence', 14188000],
    ['iX', 'xDrive60 M Excellence', 14709200],
    ['i7', '60 xDrive Pure Excellence', 14370400],
    ['i7', '60 xDrive M Excellence', 15136900],
    ['i7', 'M70 xDrive', 16000000],
  ]),
  ...cars('Mercedes-Benz', [
    ['EQA', '250+ Night Edition', 4477000, { kwh: 70.5 }],
    ['EQB', '250+ 70,5 kWh (Ağustos)', 3623156, { kwh: 70.5, range: 466 }],
    ['EQE', '280 AMG', 6108500],
    ['EQE', '350 4MATIC AMG', 6978500],
    ['EQE', '350+ 89 kWh (Ağustos)', 5500000, { kwh: 89, range: 626 }],
    ['EQS', '450 4MATIC Inspiration', 10108500],
    ['G', '580 Heritage', 15715000],
  ]),
  ...cars('BYD', [
    ['SEAL', 'Excellence', 4077000, { kwh: 82.5, range: 520 }],
    ['SEALION 7', 'Excellence', 4190000, { kwh: 91.3, range: 502 }],
    ['HAN', 'Executive', 4873000, { kwh: 85.4, range: 521 }],
    ['TANG', 'Flagship', 5418000, { kwh: 108.8, range: 530 }],
  ]),
  // ---- Aşağıdakiler yalnızca Ağustos 2026 listesinde (hibritelektrik.com) ----
  ...cars('Audi', [
    ['Q4 e-tron', '45 e-tron 82 kWh (Ağustos)', 5717317, { kwh: 82, range: 535 }],
    ['Q6 e-tron', 'Performance (Ağustos)', 4500000, { kwh: 94.9, range: 625 }],
  ]),
  ...cars('Volvo', [
    ['EX30', 'Single Motor ER (Ağustos)', 2436910, { kwh: 69, range: 480 }],
    ['EX40', 'Single Motor ER (Ağustos)', 4317300, { kwh: 69, range: 476 }],
    ['EX90', 'Twin Motor Performance (Ağustos)', 5500000, { kwh: 111, range: 590 }],
  ]),
  ...cars('Polestar', [
    ['2', 'Long Range Single Motor (Ağustos)', 2750000, { kwh: 82, range: 655 }],
    ['4', 'Long Range Single Motor (Ağustos)', 3250000, { kwh: 100, range: 620 }],
  ]),
  ...cars('MG', [
    ['ZS EV', 'Long Range Luxury (Ağustos)', 1699000, { kwh: 72.6, range: 440 }],
    ['MG4', 'Comfort', 1369000, { kwh: 51, range: 350, kw: 125 }],
    ['MG4', 'Luxury', 1499000, { kwh: 64, range: 435, kw: 150 }],
    ['MG4', 'XPOWER', 2399000, { kwh: 64, range: 385, kw: 320 }],
    ['Marvel R', 'Luxury', 2989000, { kwh: 70, range: 402, kw: 132 }],
    ['Marvel R', 'Performance', 2990000, { kwh: 70, range: 370, kw: 212 }],
  ]),
  ...cars('Toyota', [['bZ4X', '71,4 kWh AWD Premium (Ağustos)', 2850000, { kwh: 71.4, range: 470 }]]),
  ...cars('Nissan', [['Ariya', '87 kWh Evolve+ AWD (Ağustos)', 2750000, { kwh: 87, range: 525 }]]),
  ...cars('MINI', [['Countryman E', '66,5 kWh (Ağustos)', 2493300, { kwh: 66.5, range: 462 }]]),
  ...cars('KGM', [['Torres EVX', '73,4 kWh (Ağustos)', 2442439, { kwh: 73.4, range: 462 }]]),
  ...cars('Jeep', [['Avenger Electric', '54 kWh (Ağustos)', 2342000, { kwh: 54, range: 392 }]]),
  ...cars('Honda', [['e:Ny1', 'Advance 68,8 kWh (Ağustos)', 2250000, { kwh: 68.8, range: 412 }]]),
  ...cars('CUPRA', [['Born', '58 kWh 150 kW (Ağustos)', 2189029, { kwh: 58, range: 424, kw: 150 }]]),
  ...cars('smart', [['#1', 'Pro+ 66 kWh (Ağustos)', 2050000, { kwh: 66, range: 440 }]]),
  ...cars('Chery', [['Omoda E5', 'Premium 61 kWh (Ağustos)', 1700000, { kwh: 61, range: 430 }]]),
  ...cars('Skywell', [['ET5', '72 kWh (Ağustos)', 1449000, { kwh: 72, range: 520 }]]),
  ...cars('SERES', [['3', '52,6 kWh (Ağustos)', 1249000, { kwh: 52.6, range: 405 }]]),
  ...cars('Dacia', [['Spring', 'Electric 65 (Ağustos)', 899000, { kwh: 26.8, range: 225 }]]),
];

const horwin = (model: string, trim: string, price: number, batteries: 1 | 2): Row => [
  model, trim, price, { specs: [spec('Batarya sayısı', 'Batteries', String(batteries))] },
];

const MOTOS: Vehicle[] = [
  // Honda EM1 e: Eylül 2026 Honda listesinde yer alıyor ama fiyatı yazmıyor; gösterilen fiyat 2023 lansman fiyatıdır.
  ...build('moto', 'Honda', [
    ['EM1 e:', '(fiyat: 2023 lansman, güncel değil)', 110000, {
      range: 41, kwh: 1.48, kw: 1.7, specs: [spec('Azami hız', 'Top speed', ['45 km/s', '45 km/h']), spec('Çıkarılabilir batarya', 'Removable battery', ['Evet', 'Yes'])],
    }],
  ]),
  // Yamaha 18 Eylül 2026 fiyat listesi.
  ...build('moto', 'Yamaha', [
    ["NEO's", 'Çift Bataryalı', 147500, { range: 68, specs: [spec('Batarya sayısı', 'Batteries', '2')] }],
  ]),
  ...build('moto', 'Horwin', [
  horwin('SK1', 'Extended', 94900, 1),
  horwin('EK1', 'Extended', 99900, 1),
  horwin('SK3', 'Standart', 144900, 1),
  horwin('SK3', 'Extended', 189900, 2),
  horwin('SK3', 'Plus Extended', 224900, 2),
  horwin('EK3', 'Standart', 164900, 1),
  horwin('EK3', 'Extended', 214900, 2),
  ]),
];

const cargo = (m3: string): Spec => spec('Yük hacmi', 'Cargo volume', [`${m3} m³`.replace('.', ','), `${m3} m³`]);

const VANS: Vehicle[] = [
  ...build('van', 'Ford', [
    ['E-Transit Custom', 'Deluxe Van 320S', 2851500, { id: 'ford-e-transit-custom', range: 337, kw: 160, specs: [cargo('6')] }],
    ['E-Transit Custom', 'Deluxe Van 340L', 2920000, { range: 337, kw: 160 }],
    ['E-Transit Custom', 'Titanium Van 320S', 3007500, { range: 337, kw: 160 }],
    ['E-Transit', 'Minibüs 135 kW', 3970300, { range: 317, kw: 135, specs: [spec('Taşıma kapasitesi', 'Payload', ['1.744 kg', '1,744 kg']), cargo('15.1')] }],
    ['Journey Courier BEV', 'Titanium 100 kW', 2319200, { kw: 100 }],
  ]),
  ...build('van', 'Fiat', [['E-Doblo Cargo', '', 2116900]]),
  ...build('van', 'Opel', [['Combo', 'Elektrik 100 kW Edition', 2345000, { kw: 100 }]]),
];

export const VEHICLES: Vehicle[] = [...CARS, ...MOTOS, ...VANS];
