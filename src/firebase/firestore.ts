import { collection, doc, onSnapshot, orderBy, query, setDoc, type Unsubscribe } from 'firebase/firestore';
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

export const watchVehicles = (cb: (v: Vehicle[]) => void) => watchCollection<Vehicle>('vehicles', cb);
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

export async function saveUser(uid: string, data: object): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
  } catch (e) {
    console.warn('[firestore] saveUser:', (e as Error).message);
  }
}
