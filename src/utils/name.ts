import type { UserProfile } from '../types';

const upperFirst = (ch: string) => (ch === 'i' ? 'İ' : ch === 'ı' ? 'I' : ch.toUpperCase());

/** Her kelimenin ilk harfini (Türkçe kurallarıyla) büyük yapar: "umut yenikardeşler" -> "Umut Yenikardeşler". */
export function capitalizeName(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => upperFirst(w.charAt(0)) + w.slice(1))
    .join(' ');
}

/** Tam adı ad / soyad olarak ayırır (son kelime soyad). */
export function splitName(full: string): { firstName: string; lastName: string } {
  const parts = capitalizeName(full).split(' ').filter(Boolean);
  if (parts.length < 2) return { firstName: parts[0] ?? '', lastName: '' };
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
}

type NameSource = Pick<UserProfile, 'name'> & Partial<Pick<UserProfile, 'firstName' | 'lastName'>>;

export function nameParts(p?: NameSource | null): { firstName: string; lastName: string; full: string } {
  if (!p) return { firstName: '', lastName: '', full: '' };
  const s = p.firstName !== undefined ? { firstName: p.firstName, lastName: p.lastName ?? '' } : splitName(p.name);
  const firstName = capitalizeName(s.firstName);
  const lastName = capitalizeName(s.lastName);
  return { firstName, lastName, full: `${firstName} ${lastName}`.trim() };
}
