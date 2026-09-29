export type Currency = 'TRY' | 'USD' | 'EUR';

export const CURRENCIES: Currency[] = ['TRY', 'USD', 'EUR'];
export const SYMBOL: Record<Currency, string> = { TRY: '₺', USD: '$', EUR: '€' };

/** 1 TL kaç USD / EUR eder. */
export interface Rates {
  USD: number;
  EUR: number;
  /** Kurun tarihi (YYYY-MM-DD) */
  date: string;
}

/** İnternet yokken kullanılan son bilinen kurlar (29 Eylül 2026, ECB). */
export const FALLBACK_RATES: Rates = { USD: 0.02041, EUR: 0.01797, date: '2026-09-29' };

/** TL cinsinden tutarı seçilen para birimine çevirir. */
export const convert = (tl: number, currency: Currency, rates: Rates) =>
  currency === 'TRY' ? tl : tl * rates[currency];

/** 1 USD / EUR kaç TL (kur bilgisi satırı için). */
export const tlPer = (currency: Exclude<Currency, 'TRY'>, rates: Rates) => 1 / rates[currency];
