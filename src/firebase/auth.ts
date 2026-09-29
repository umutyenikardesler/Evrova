import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
} from 'firebase/auth';
import type { TKey } from '../i18n';
import { auth } from './config';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
}

/** Firebase hata kodunu i18n anahtarına çevirir. */
export function authErrorKey(err: unknown): TKey {
  const code = (err as { code?: string })?.code ?? '';
  if (code === 'auth/email-already-in-use') return 'auth.errInUse';
  if (code === 'auth/network-request-failed') return 'auth.errNetwork';
  if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'].includes(code))
    return 'auth.errCredentials';
  return 'auth.errGeneric';
}

// ---- Demo modu (Firebase yapılandırılmamış) -------------------------------
let demoUser: AuthUser | null = null;
const demoListeners = new Set<(u: AuthUser | null) => void>();
const setDemo = (u: AuthUser | null) => {
  demoUser = u;
  demoListeners.forEach((l) => l(u));
};
const nameFromEmail = (email: string) => {
  const n = email.split('@')[0] || 'Deniz';
  return n.charAt(0).toUpperCase() + n.slice(1);
};

const toUser = (u: { uid: string; email: string | null; displayName: string | null }): AuthUser => ({
  uid: u.uid,
  email: u.email ?? '',
  displayName: u.displayName || nameFromEmail(u.email ?? ''),
});

export function subscribeAuth(cb: (u: AuthUser | null) => void): () => void {
  if (!auth) {
    demoListeners.add(cb);
    cb(demoUser);
    return () => demoListeners.delete(cb);
  }
  return onAuthStateChanged(auth, (u) => cb(u ? toUser(u) : null));
}

export async function signIn(email: string, password: string): Promise<void> {
  if (!auth) return setDemo({ uid: 'demo', email, displayName: nameFromEmail(email) });
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signUp(name: string, email: string, password: string): Promise<void> {
  if (!auth) return setDemo({ uid: 'demo', email, displayName: name });
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
}

export async function resetPassword(email: string): Promise<void> {
  if (!auth) return;
  await sendPasswordResetEmail(auth, email);
}

export async function signOut(): Promise<void> {
  if (!auth) return setDemo(null);
  await fbSignOut(auth);
}
