/** Aramada büyük/küçük harf, aksan ve Türkçe i/ı farkı yok sayılır. */
export const fold = (x: string) => x.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').toLowerCase();

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
