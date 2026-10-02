import type { Vehicle } from '../types';

/** Markayı döndürür; belgede yoksa adın ilk kelimesi. */
export const brandOf = (v: Vehicle) => v.brand ?? v.name.split(' ')[0];

/** Model adı; belgede yoksa markadan sonraki kısım ("Volta Şehir" -> "Şehir"). */
export const modelOf = (v: Vehicle) => {
  if (v.model) return v.model;
  const b = brandOf(v);
  return v.name.startsWith(b + ' ') ? v.name.slice(b.length + 1) : v.name;
};

/** Paket/versiyon adı; yoksa boş. */
export const trimOf = (v: Vehicle) => v.trim ?? '';

function groupCount(list: Vehicle[], key: (v: Vehicle) => string) {
  const map = new Map<string, number>();
  list.forEach((v) => map.set(key(v), (map.get(key(v)) ?? 0) + 1));
  return [...map].map(([name, count]) => ({ name, count }));
}

const byName = (a: string, b: string) => a.localeCompare(b, 'tr', { numeric: true, sensitivity: 'base' });

/** Markalar (A-Z) ve model sayıları. */
export const brandsOf = (list: Vehicle[]) =>
  [...new Set(list.map(brandOf))].sort(byName).map((brand) => ({
    brand,
    count: new Set(list.filter((v) => brandOf(v) === brand).map(modelOf)).size,
  }));

/** Bir markanın modelleri (A-Z, sayılar doğal sırada) ve paket sayıları. */
export const modelsOf = (list: Vehicle[]) => groupCount(list, modelOf).sort((a, b) => byName(a.name, b.name));
