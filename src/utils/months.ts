import type { Lang } from '../i18n';

/** "2026-10" biçiminde yıl-ay. */
export type YearMonth = string;

const LONG = {
  tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
const SHORT = {
  tr: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

const parse = (ym: YearMonth) => {
  const [y, m] = ym.split('-').map(Number);
  return { y, m: m - 1 };
};

/** Ay sayısı kadar ileri/geri gider: shiftMonth("2026-10", -11) -> "2025-11". */
export function shiftMonth(ym: YearMonth, delta: number): YearMonth {
  const { y, m } = parse(ym);
  const t = y * 12 + m + delta;
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}`;
}

/** "Eylül" / "September" */
export const monthName = (lang: Lang, ym: YearMonth) => LONG[lang][parse(ym).m];

/** "Eylül 2026" / "September 2026" */
export const monthLong = (lang: Lang, ym: YearMonth) => `${monthName(lang, ym)} ${parse(ym).y}`;

/** Rozetlerde kısa başlık: "Ekim 2026" / "Oct 2026" */
export const monthTitle = (lang: Lang, ym: YearMonth) =>
  lang === 'tr' ? monthLong(lang, ym) : `${SHORT.en[parse(ym).m]} ${parse(ym).y}`;

/** Fiyat serisinin (12 ay) etiketleri: son ay `listMonth`. short: Eki, long: Ekim 2025 */
export function monthLabels(lang: Lang, listMonth: YearMonth) {
  const list = Array.from({ length: 12 }, (_, i) => shiftMonth(listMonth, i - 11));
  return {
    short: list.map((ym) => SHORT[lang][parse(ym).m]),
    long: list.map((ym) => monthLong(lang, ym)),
    first: monthTitle(lang, list[0]),
    last: monthTitle(lang, list[11]),
  };
}

/** Şu anki ay ("2026-10"), cihaz tarihine göre. */
export const thisMonth = (d: Date = new Date()): YearMonth => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
