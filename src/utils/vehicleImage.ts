import { VEHICLE_GALLERY, VEHICLE_IMAGES, type VehicleImage } from '../data/vehicleImages';
import type { Vehicle } from '../types';
import { brandOf, modelOf, trimOf } from './brand';

const modelKey = (v: Vehicle) => `${brandOf(v)}|${modelOf(v)}`;

/** Modelin kapak fotoğrafı ("Marka|Model"). */
export const modelImage = (v: Vehicle): VehicleImage | undefined => VEHICLE_IMAGES[modelKey(v)];

/** Pakete özel fotoğraf varsa o, yoksa modelin kapak fotoğrafı. */
export const versionImage = (v: Vehicle): VehicleImage | undefined =>
  VEHICLE_IMAGES[`${modelKey(v)}|${trimOf(v)}`] ?? modelImage(v);

/** Detay slider'ı: paket fotoğrafı, model kapağı ve galeri (tekrarsız, en fazla 5). */
export function vehicleGallery(v: Vehicle): VehicleImage[] {
  const trimGallery = VEHICLE_GALLERY[`${modelKey(v)}|${trimOf(v)}`];
  // Paket galerisi varsa (ör. Tesla paketleri) yalnızca o paketin fotoğrafları gösterilir.
  const all = trimGallery ? [versionImage(v), ...trimGallery] : [versionImage(v), modelImage(v), ...(VEHICLE_GALLERY[modelKey(v)] ?? [])];
  const seen = new Set<string>();
  return all.filter((im): im is VehicleImage => !!im && !seen.has(im.title) && !!seen.add(im.title)).slice(0, 5);
}
