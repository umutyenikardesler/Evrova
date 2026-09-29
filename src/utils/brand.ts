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

/** Markalar ve model sayıları (ilk görünme sırasıyla). */
export const brandsOf = (list: Vehicle[]) =>
  [...new Map(list.map((v) => [brandOf(v), new Set<string>()])).keys()].map((brand) => ({
    brand,
    count: new Set(list.filter((v) => brandOf(v) === brand).map(modelOf)).size,
  }));

/** Bir markanın modelleri ve paket sayıları. */
export const modelsOf = (list: Vehicle[]) => groupCount(list, modelOf);
