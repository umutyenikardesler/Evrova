// Elektrikli otomobillerde 2026 ÖTV ve MTV değerleri (bilgi amaçlıdır; kesin değerler için gib.gov.tr).
// Kaynaklar: elektrikliarac.com (2026 MTV tutarları), watmobilite.com / yesilhaber.net (2026 ÖTV dilimleri).
// Doğrulama: Mercedes EQA 250+ ekim 2026 listesi — matrah 2.479.570 TL, ÖTV %55, KDV %20 -> 4.612.000 TL.

/** Motor gücü sınırı (kW) ve ÖTV matrah sınırı (TL). */
export const KW_LIMIT = 160;
export const MATRAH_LIMIT = 1_650_000;
export const KDV = 0.2;

/** ÖTV oranları: [matrah ≤ sınır, matrah > sınır]. */
export const OTV = {
  low: [0.25, 0.55], // 160 kW'ı geçmeyen
  high: [0.65, 0.75], // 160 kW'ı geçen
} as const;

/** MTV (yıllık, TL): [en çok kW, 1-3 yaş, 4-6 yaş, 7-11 yaş]. Son satır 301 kW ve üstü (diğer yaşlar yayımlanmamış). */
export const MTV: readonly (readonly [number, number, number | null, number | null])[] = [
  [70, 1437, 1002, 559],
  [85, 2504, 1877, 1088],
  [105, 4426, 3457, 2036],
  [120, 6974, 5369, 3156],
  [150, 10460, 7593, 4744],
  [180, 14586, 12688, 7926],
  [210, 22214, 19988, 12039],
  [240, 34930, 30161, 17762],
  [300, 57170, 42871, 25388],
  [Infinity, 62888, null, null],
];

export interface TaxBreakdown {
  rate: number;
  matrah: number;
  otv: number;
  kdv: number;
  tax: number;
}

/** Anahtar teslim fiyattan geriye doğru matrah, ÖTV ve KDV'yi çıkarır. */
export function breakdown(total: number, kw: number): TaxBreakdown {
  const [lo, hi] = kw > KW_LIMIT ? OTV.high : OTV.low;
  const mLo = total / (1 + lo) / (1 + KDV);
  const rate = mLo <= MATRAH_LIMIT ? lo : hi;
  const matrah = rate === lo ? mLo : total / (1 + hi) / (1 + KDV);
  const otv = matrah * rate;
  const kdv = (matrah + otv) * KDV;
  return { rate, matrah, otv, kdv, tax: otv + kdv };
}

/** Motor gücüne göre yıllık MTV (1-3 yaş). */
export const mtvFor = (kw: number) => (MTV.find((r) => kw <= r[0]) ?? MTV[MTV.length - 1])[1];
