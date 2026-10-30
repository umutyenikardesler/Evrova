import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, type Unsubscribe } from 'firebase/firestore';
import type { AppNotification, NewsItem, UserProfile, Vehicle } from '../types';
import { db } from './config';

/**
 * Koleksiyonlar:
 *  vehicles/{id}        -> Vehicle
 *  news/{id}            -> NewsItem
 *  notifications/{id}   -> AppNotification (herkese açık duyurular)
 *  users/{uid}          -> UserProfile + pushToken / devicePushToken
 */

function watchCollection<T>(name: string, onData: (items: T[]) => void, orderField?: string): Unsubscribe {
  if (!db) return () => {};
  const ref = orderField ? query(collection(db, name), orderBy(orderField, 'desc')) : collection(db, name);
  return onSnapshot(
    ref,
    (snap) => {
      // Boş koleksiyonda yerel (bundled) veri gösterilmeye devam eder.
      if (!snap.empty) onData(snap.docs.map((d) => ({ ...(d.data() as object), id: d.id }) as T));
    },
    (err) => console.warn(`[firestore] ${name}:`, err.message),
  );
}

// listMonth'u olmayan eski kayıtlar Eylül 2026 listesinden kalmadır (taban ay).
export const watchVehicles = (cb: (v: Vehicle[]) => void) =>
  watchCollection<Vehicle>('vehicles', (list) => cb(list.map((v) => ({ ...v, listMonth: v.listMonth ?? '2026-09' }))));
export const watchNews = (cb: (n: NewsItem[]) => void) => watchCollection<NewsItem>('news', cb);
export const watchNotifications = (cb: (n: AppNotification[]) => void) =>
  watchCollection<AppNotification>('notifications', cb, 'createdAt');

export function watchUser(uid: string, cb: (p: Partial<UserProfile> | null) => void): Unsubscribe {
  if (!db) return () => {};
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => cb(snap.exists() ? (snap.data() as Partial<UserProfile>) : null),
    (err) => console.warn('[firestore] user:', err.message),
  );
}

/** Hesap silinirken profil belgesinin dinleyici tarafından yeniden oluşturulmasını önler. */
let userWritesLocked = false;
export const setUserWritesLocked = (locked: boolean) => { userWritesLocked = locked; };

export async function saveUser(uid: string, data: object): Promise<void> {
  if (!db || userWritesLocked) return;
  try {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
  } catch (e) {
    console.warn('[firestore] saveUser:', (e as Error).message);
  }
}

/** Kullanıcının profil belgesini (tercihler, bildirim kodları) siler. */
export async function deleteUserData(uid: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, 'users', uid));
}
