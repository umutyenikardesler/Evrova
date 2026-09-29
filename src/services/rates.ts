import AsyncStorage from '@react-native-async-storage/async-storage';
import { FALLBACK_RATES, type Rates } from '../utils/currency';

const KEY = 'evrova.rates';
const MAX_AGE = 12 * 3600 * 1000;

interface Cached extends Rates {
  fetchedAt: number;
}

/** Son kaydedilen kurlar (yoksa yedek kurlar). */
export async function cachedRates(): Promise<Rates> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Cached;
  } catch {}
  return FALLBACK_RATES;
}

/** Kurları günceller (ECB verisi, frankfurter.dev). 12 saatten yeniyse ağa gitmez. */
export async function refreshRates(): Promise<Rates | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw && Date.now() - (JSON.parse(raw) as Cached).fetchedAt < MAX_AGE) return null;
  } catch {}
  try {
    const res = await fetch('https://api.frankfurter.dev/v1/latest?base=TRY&symbols=USD,EUR');
    if (!res.ok) return null;
    const j = (await res.json()) as { date: string; rates: { USD: number; EUR: number } };
    const next: Cached = { USD: j.rates.USD, EUR: j.rates.EUR, date: j.date, fetchedAt: Date.now() };
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return null;
  }
}
