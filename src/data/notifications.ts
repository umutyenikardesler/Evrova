import type { AppNotification } from '../types.ts';
import { LIST_MONTH, VEHICLES } from './vehicles.ts';

// Bildirim metinleri liste ayına göre (src/utils/months.ts RN'e özgü olmadığı için burada sade tutuldu: Node betikleri de bu dosyayı içe aktarır)
const MONTH_TR: Record<string, string> = { '01': 'Ocak', '02': 'Şubat', '03': 'Mart', '04': 'Nisan', '05': 'Mayıs', '06': 'Haziran', '07': 'Temmuz', '08': 'Ağustos', '09': 'Eylül', '10': 'Ekim', '11': 'Kasım', '12': 'Aralık' };
const MONTH_EN: Record<string, string> = { '01': 'January', '02': 'February', '03': 'March', '04': 'April', '05': 'May', '06': 'June', '07': 'July', '08': 'August', '09': 'September', '10': 'October', '11': 'November', '12': 'December' };

const H = 3600 * 1000;
const ago = (hours: number) => Date.now() - hours * H;

const lastChange = (id: string) => {
  const v = VEHICLES.find((x) => x.id === id);
  const p = v?.prices ?? [1, 1];
  return { name: v?.name ?? id, pct: ((p[p.length - 1] - p[p.length - 2]) / p[p.length - 2]) * 100 };
};
const fmt = (x: number, lang: 'tr' | 'en') => Math.abs(x).toFixed(1).replace('.', lang === 'tr' ? ',' : '.');

/** Firestore boşken / çevrimdışıyken gösterilen örnek bildirimler. */
export const localNotifications = (): AppNotification[] => {
  const a = lastChange('togg-t10x-std');
  const b = lastChange('ford-e-transit-custom');
  const word = (x: number) => ({ tr: x > 0 ? 'arttı' : 'düştü', en: x > 0 ? 'went up' : 'dropped' });
  const verb = (x: number) => ({ tr: x > 0 ? 'yükseldi' : 'geriledi', en: x > 0 ? 'rose' : 'fell' });
  return [
    {
      id: 'a1', kind: 'price', createdAt: ago(2), vehicleId: 'togg-t10x-std',
      title: { tr: `${a.name} fiyatı ${word(a.pct).tr}`, en: `${a.name} price ${word(a.pct).en}` },
      text: {
        tr: `${MONTH_TR[LIST_MONTH.slice(5)]} listesinde fiyat önceki aya göre %${fmt(a.pct, 'tr')} ${verb(a.pct).tr}.`,
        en: `In the ${MONTH_EN[LIST_MONTH.slice(5)]} list the price ${verb(a.pct).en} ${fmt(a.pct, 'en')}% vs. the previous month.`,
      },
    },
    {
      id: 'a2', kind: 'news', createdAt: ago(5), newsId: 'n1',
      title: { tr: 'Yeni haber: Batarya', en: 'New story: Battery' },
      text: { tr: 'Katı hal hücreleri pilot üretim hattına taşındı.', en: 'Solid-state cells move to pilot production lines.' },
    },
    {
      id: 'a3', kind: 'price', createdAt: ago(28), vehicleId: 'ford-e-transit-custom',
      title: { tr: `${b.name} fiyatı ${word(b.pct).tr}`, en: `${b.name} price ${word(b.pct).en}` },
      text: {
        tr: `${MONTH_TR[LIST_MONTH.slice(5)]} listesinde fiyat önceki aya göre %${fmt(b.pct, 'tr')} ${verb(b.pct).tr}.`,
        en: `In the ${MONTH_EN[LIST_MONTH.slice(5)]} list the price ${verb(b.pct).en} ${fmt(b.pct, 'en')}% vs. the previous month.`,
      },
    },
    {
      id: 'a4', kind: 'news', createdAt: ago(24 * 3 + 1), newsId: 'n2',
      title: { tr: 'Yeni haber: Şarj', en: 'New story: Charging' },
      text: { tr: 'Otoyol güzergâhlarında yüksek güçlü şarj noktaları çoğalıyor.', en: 'High-power charging points multiply along highways.' },
    },
    {
      id: 'a5', kind: 'system', createdAt: ago(24 * 7 + 1),
      title: { tr: `${MONTH_TR[LIST_MONTH.slice(5)]} fiyat listeleri yayında`, en: `${MONTH_EN[LIST_MONTH.slice(5)]} price lists are live` },
      text: { tr: 'Tüm modellerin aylık fiyatları güncellendi.', en: 'Monthly prices of all models have been updated.' },
    },
  ];
};
