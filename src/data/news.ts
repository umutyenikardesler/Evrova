import type { L10n } from '../i18n';
import type { NewsItem } from '../types';
import { NEWS_DATA } from './newsData.ts';

export const NEWS_CATS: { id: string; label: L10n }[] = [
  { id: 'battery', label: { tr: 'Batarya', en: 'Battery' } },
  { id: 'charging', label: { tr: 'Şarj', en: 'Charging' } },
  { id: 'moto', label: { tr: 'Motosiklet', en: 'Motorcycle' } },
  { id: 'software', label: { tr: 'Yazılım', en: 'Software' } },
  { id: 'commercial', label: { tr: 'Ticari', en: 'Commercial' } },
];

// Haberler data/news-items.json dosyasında tutulur (kaynak sayfalardan özetlenip yeniden yazılır); buradaki NEWS otomatik üretilen
// src/data/newsData.ts'ten gelir. Haber ekleme: scripts/news-add.mjs (36 saatte bir zamanlanmış görev) ya da JSON'u elle düzenleyip
// 'npm run news:build', ardından 'npm run seed:news'.
export const NEWS: NewsItem[] = NEWS_DATA;
