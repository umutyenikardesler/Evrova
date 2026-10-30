import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  reauthenticateWithCredential,
  revokeAccessToken,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updatePassword,
  updateProfile,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';
import type { TKey } from '../i18n';
import { auth } from './config';
import { deleteUserData, setUserWritesLocked } from './firestore';
import { reauthWithSocial, type SocialKind } from './social';

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
  if (code === 'auth/weak-password') return 'auth.errPassword';
  if (code === 'auth/invalid-new-email') return 'auth.errEmail';
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

// Kayıt sırasında girilen ad. Firebase kullanıcıyı oluşturur oluşturmaz giriş durumu değişir ve uygulama profili hemen yazar;
// ad (updateProfile) ise ondan sonra eklenir. Bu yüzden o anda ad e-postadan üretilmesin diye burada tutulur.
let pendingDisplayName: string | null = null;

const toUser = (u: { uid: string; email: string | null; displayName: string | null }): AuthUser => ({
  uid: u.uid,
  email: u.email ?? '',
  displayName: u.displayName || pendingDisplayName || nameFromEmail(u.email ?? ''),
});

export function subscribeAuth(cb: (u: AuthUser | null) => void): () => void {
  if (!auth) {
    demoListeners.add(cb);
    cb(demoUser);
    return () => demoListeners.delete(cb);
  }
  return onAuthStateChanged(auth, (u) => {
    if (u) setUserWritesLocked(false); // yeni oturum: profil yazımları açık
    cb(u ? toUser(u) : null);
  });
}

export async function signIn(email: string, password: string): Promise<void> {
  if (!auth) return setDemo({ uid: 'demo', email, displayName: nameFromEmail(email) });
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signUp(name: string, email: string, password: string): Promise<void> {
  if (!auth) return setDemo({ uid: 'demo', email, displayName: name });
  pendingDisplayName = name;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
  } finally {
    pendingDisplayName = null;
  }
}

export async function resetPassword(email: string): Promise<void> {
  if (!auth) return;
  await sendPasswordResetEmail(auth, email);
}

export async function signOut(): Promise<void> {
  if (!auth) return setDemo(null);
  await fbSignOut(auth);
}

// ---- Hesap yönetimi --------------------------------------------------------
/** Hesabın giriş yöntemi: e-posta/şifre, Apple, Google ya da demo (Firebase'siz). */
export type AccountKind = 'password' | 'apple' | 'google' | 'demo';
export function accountKind(): AccountKind {
  const ids = auth?.currentUser?.providerData.map((p) => p.providerId) ?? [];
  if (ids.includes('password')) return 'password';
  if (ids.includes('apple.com')) return 'apple';
  if (ids.includes('google.com')) return 'google';
  return 'demo';
}

/** Hassas işlemlerden önce mevcut şifreyle yeniden doğrular. */
async function reauthWithPassword(currentPassword: string) {
  const user = auth?.currentUser;
  if (!user?.email) throw Object.assign(new Error('no-user'), { code: 'auth/user-not-found' });
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
}

/** Şifreyi değiştirir (mevcut şifreyle yeniden doğrulama gerekir). */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  if (!auth?.currentUser) return;
  await reauthWithPassword(currentPassword);
  await updatePassword(auth.currentUser, newPassword);
}

/**
 * Apple/Google ile açılmış hesaba e-posta + şifre girişi ekler (hesaba şifre oluşturur).
 * Oturum yeniyse doğrudan bağlanır; Firebase "yakın zamanda giriş" isterse sağlayıcıyla yeniden doğrulanıp tekrar denenir.
 * Kullanıcı bu doğrulamayı iptal ederse false döner.
 */
export async function createPassword(newPassword: string): Promise<boolean> {
  const user = auth?.currentUser;
  const kind = accountKind();
  if (!user?.email || (kind !== 'apple' && kind !== 'google')) return false;
  const credential = EmailAuthProvider.credential(user.email, newPassword);
  try {
    await linkWithCredential(user, credential);
  } catch (e) {
    if ((e as { code?: string })?.code !== 'auth/requires-recent-login') throw e;
    if ((await reauthWithSocial(kind)) === false) return false;
    await linkWithCredential(user, credential);
  }
  return true;
}

/**
 * E-postayı değiştirir: yeni adrese doğrulama bağlantısı gider, adres bağlantıya dokunulunca değişir
 * (Firebase doğrulanmamış adrese doğrudan geçişe izin vermez).
 */
export async function changeEmail(currentPassword: string, newEmail: string): Promise<void> {
  if (!auth?.currentUser) return;
  await reauthWithPassword(currentPassword);
  await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
}

/**
 * Hesabı kalıcı olarak siler: yeniden doğrulama (şifre ya da Apple/Google) → Firestore profil belgesi → Firebase kullanıcısı.
 * Başarıda oturum kapanır; uygulama giriş ekranına döner. Kullanıcı sosyal doğrulamayı iptal ederse false döner.
 */
export async function deleteAccount(currentPassword?: string): Promise<boolean> {
  const user = auth?.currentUser;
  if (!auth || !user) {
    setDemo(null);
    return true;
  }
  const kind = accountKind();
  let appleCode: string | undefined;
  if (kind === 'password') {
    await reauthWithPassword(currentPassword ?? '');
  } else {
    const res = await reauthWithSocial(kind === 'apple' ? 'apple' : 'google' satisfies SocialKind);
    if (res === false) return false;
    appleCode = res.appleCode;
  }
  setUserWritesLocked(true);
  try {
    await deleteUserData(user.uid);
    // App Store: Apple ile açılan hesap silinirken Apple token'ı iptal edilmelidir. Başarısızlık silmeyi engellemez.
    if (appleCode) await revokeAccessToken(auth, appleCode).catch(() => {});
    await deleteUser(user);
  } catch (e) {
    setUserWritesLocked(false); // hesap duruyor; profil yazımları devam etmeli
    throw e;
  }
  return true;
}
