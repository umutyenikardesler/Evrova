import tr, { type Dict } from './tr';
import en from './en';

export type Lang = 'tr' | 'en';
export type L10n = { tr: string; en: string };

export const dictionaries: Record<Lang, Dict> = { tr, en };

type Paths<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Paths<T[K], `${P}${K}.`>;
}[keyof T & string];
export type TKey = Paths<Dict>;

export function translate(lang: Lang, key: TKey, vars?: Record<string, string | number>): string {
  let cur: unknown = dictionaries[lang];
  for (const part of key.split('.')) cur = (cur as Record<string, unknown>)?.[part];
  let out = typeof cur === 'string' ? cur : key;
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.replace(`{${k}}`, String(v));
  return out;
}
