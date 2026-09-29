import type { Lang, TKey } from '../i18n';
import { convert, FALLBACK_RATES, SYMBOL, type Currency, type Rates } from './currency';

type T = (key: TKey, vars?: Record<string, string | number>) => string;

const group = (n: number, lang: Lang) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'tr' ? '.' : ',');

const dec = (n: number, digits: number, lang: Lang) => {
  const s = n.toFixed(digits).replace(/\.?0+$/, '');
  return lang === 'tr' ? s.replace('.', ',') : s;
};

export function formatPrice(tl: number, lang: Lang, compact: boolean, currency: Currency = 'TRY', rates: Rates = FALLBACK_RATES): string {
  const n = convert(tl, currency, rates);
  const sym = SYMBOL[currency];
  const foreign = currency !== 'TRY';
  const wrap = (s: string) => (foreign ? `${sym}${s}` : `${s} ${sym}`);
  if (compact) {
    if (n >= 1e6) return wrap(`${dec(n / 1e6, 2, lang)} M`);
    return wrap(`${Math.round(n / 1000)} ${lang === 'tr' ? 'B' : 'K'}`);
  }
  return wrap(group(n, lang));
}

export const pctChange = (a: number, b: number) => ((b - a) / a) * 100;

export function formatPct(x: number, lang: Lang): string {
  const sign = x > 0 ? '+' : x < 0 ? '−' : '±';
  const v = Math.abs(x).toFixed(1);
  return `${sign}${lang === 'tr' ? v.replace('.', ',') : v}%`;
}

export const formatBattery = (kwh: number, lang: Lang) => `${dec(kwh, 1, lang)} kWh`;

export function relativeTime(ts: number, t: T): string {
  const hours = Math.floor((Date.now() - ts) / 3600000);
  if (hours < 1) return t('time.now');
  if (hours < 24) return t('time.hours', { n: hours });
  const days = Math.floor(hours / 24);
  if (days === 1) return t('time.yesterday');
  if (days < 7) return t('time.days', { n: days });
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? t('time.week') : t('time.weeks', { n: weeks });
}

export const MONTHS = {
  tr: ['Eki', 'Kas', 'Ara', 'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl'],
  en: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
};
export const MONTHS_LONG = {
  tr: ['Ekim 2025', 'Kasım 2025', 'Aralık 2025', 'Ocak 2026', 'Şubat 2026', 'Mart 2026', 'Nisan 2026', 'Mayıs 2026', 'Haziran 2026', 'Temmuz 2026', 'Ağustos 2026', 'Eylül 2026'],
  en: ['October 2025', 'November 2025', 'December 2025', 'January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026', 'July 2026', 'August 2026', 'September 2026'],
};
