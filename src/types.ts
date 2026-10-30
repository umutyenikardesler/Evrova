import type { L10n } from './i18n';

export type VehicleType = 'moto' | 'car' | 'van';

export interface Spec {
  label: L10n;
  value: L10n;
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  /** Marka (Firestore belgesinde yoksa adın ilk kelimesi kullanılır) */
  brand?: string;
  /** Model (ör. T10X) ve paket/versiyon (ör. V1 RWD Standart Menzil) */
  model?: string;
  trim?: string;
  name: string;
  tagline: L10n;
  rangeKm?: number;
  batteryKwh?: number;
  /** 12 aylık liste fiyatı (Eki 2025 → Eyl 2026), TL */
  /** Aylık liste fiyatları (eskiden yeniye, son = listMonth). Yeni tanıtılan modellerde yalnızca fiyatlandığı aylar bulunur (1..12 ay). */
  prices: number[];
  /** İlk fiyatlandığı ay (YYYY-MM); yeni modellerde grafik bu aydan başlar. */
  since?: string;
  /** Serinin son ayı ("YYYY-MM"); yoksa uygulamadaki en yeni liste ayı kullanılır */
  listMonth?: string;
  specs: Spec[];
}

/** Şarj istasyonu (OpenStreetMap kaynaklı; bkz. scripts/fetch-chargers.mjs). */
export interface Charger {
  id: string;
  name: string;
  operator: string;
  lat: number;
  lon: number;
  /** Soket tipine göre yuva sayısı. */
  sockets: { ccs?: number; chademo?: number; type2?: number; type1?: number; tesla?: number };
  /** Hızlı (DC) şarj var mı. */
  dc: boolean;
  /** Bilinen en yüksek çıkış gücü (kW). */
  kw?: number;
  /** İl. */
  city?: string;
  /** İlçe. */
  district?: string;
  fee?: boolean;
  /** OSM opening_hours değeri. */
  hours?: string;
}

export interface NewsItem {
  id: string;
  cat: string;
  title: L10n;
  /** "28 Eyl" gibi gösterilecek tarih */
  date: L10n;
  readMin: number;
  /** Yayın tarihi (YYYY-MM-DD); liste yeniden eskiye sıralanır. */
  published: string;
  /** Haberin özetlendiği kaynak sayfa. */
  source?: { name: string; url: string };
  /** Haberin kendi görseli (uzak URL + atıf); gömülü görsel yoksa kullanılır. */
  photo?: { url: string; author: string; license: string; page: string };
  body: { tr: string[]; en: string[] };
}

export type NotifKind = 'price' | 'news' | 'system';

export interface AppNotification {
  id: string;
  kind: NotifKind;
  title: L10n;
  text: L10n;
  /** epoch ms */
  createdAt: number;
  newsId?: string;
  vehicleId?: string;
}

export interface UserProfile {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  watch: string[];
  alarms: Record<string, boolean>;
  readNotifs: string[];
  notif: boolean;
  compact: boolean;
  currency?: 'TRY' | 'USD' | 'EUR';
  lang: 'tr' | 'en';
}
