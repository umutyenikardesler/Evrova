import {
  GoogleAuthProvider, OAuthProvider, reauthenticateWithCredential, signInWithCredential, updateProfile, type AuthCredential,
} from 'firebase/auth';
import { Platform } from 'react-native';
import { auth } from './config';

export type SocialKind = 'apple' | 'google';

/** Sağlayıcı bu cihazda/yapılandırmada kullanılamıyor (web, demo modu, eksik client ID, Expo Go). */
export const SOCIAL_UNAVAILABLE = 'social/unavailable';
const unavailable = () => Object.assign(new Error(SOCIAL_UNAVAILABLE), { code: SOCIAL_UNAVAILABLE });

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

/** 'signin': giriş yapar. 'reauth': mevcut kullanıcıyı yeniden doğrular (hesap silme gibi hassas işlemler için). */
type Mode = 'signin' | 'reauth';
/** Başarıda sonuç; kullanıcı iptal ederse false. `appleCode`: Apple token'ını iptal etmek için yetkilendirme kodu. */
type Result = false | { appleCode?: string };

async function finish(cred: AuthCredential, mode: Mode) {
  if (!auth) throw unavailable();
  if (mode === 'reauth') {
    if (!auth.currentUser) throw unavailable();
    return reauthenticateWithCredential(auth.currentUser, cred);
  }
  return signInWithCredential(auth, cred);
}

/** Apple ile giriş: yalnızca iOS. */
async function apple(mode: Mode): Promise<Result> {
  if (!auth || Platform.OS !== 'ios') throw unavailable();
  const AppleAuth = await import('expo-apple-authentication');
  const Crypto = await import('expo-crypto');
  if (!(await AppleAuth.isAvailableAsync())) throw unavailable();

  // Apple'a nonce'un SHA-256 özeti, Firebase'e ham hali gider.
  const rawNonce = Crypto.randomUUID();
  const nonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  let credential;
  try {
    credential = await AppleAuth.signInAsync({
      requestedScopes: [AppleAuth.AppleAuthenticationScope.FULL_NAME, AppleAuth.AppleAuthenticationScope.EMAIL],
      nonce,
    });
  } catch (e) {
    if ((e as { code?: string })?.code === 'ERR_REQUEST_CANCELED') return false;
    throw e;
  }
  if (!credential.identityToken) throw unavailable();

  const result = await finish(new OAuthProvider('apple.com').credential({ idToken: credential.identityToken, rawNonce }), mode);
  if (mode === 'signin') {
    // Apple adı yalnızca ilk girişte verir.
    const { givenName, familyName } = credential.fullName ?? {};
    const name = [givenName, familyName].filter(Boolean).join(' ');
    if (name && !result.user.displayName) await updateProfile(result.user, { displayName: name });
  }
  return { appleCode: credential.authorizationCode ?? undefined };
}

/** Google ile giriş: iOS ve Android (development build). */
async function google(mode: Mode): Promise<Result> {
  if (!auth || Platform.OS === 'web' || !webClientId) throw unavailable();
  let GoogleSignin: typeof import('@react-native-google-signin/google-signin').GoogleSignin;
  try {
    ({ GoogleSignin } = await import('@react-native-google-signin/google-signin'));
  } catch {
    throw unavailable(); // native modül yok (Expo Go)
  }
  GoogleSignin.configure({ webClientId, iosClientId });
  if (Platform.OS === 'android') await GoogleSignin.hasPlayServices();
  const res = await GoogleSignin.signIn();
  if (res.type !== 'success' || !res.data.idToken) return false;
  await finish(GoogleAuthProvider.credential(res.data.idToken), mode);
  return {};
}

const run = (kind: SocialKind, mode: Mode): Promise<Result> => (kind === 'apple' ? apple(mode) : google(mode));

/** Sosyal girişi başlatır; kullanıcı iptal ederse false döner. */
export const signInWithSocial = async (kind: SocialKind): Promise<boolean> => (await run(kind, 'signin')) !== false;

/** Sosyal sağlayıcıyla mevcut kullanıcıyı yeniden doğrular; iptalde false, başarıda sonuç (Apple için yetkilendirme kodu). */
export const reauthWithSocial = (kind: SocialKind): Promise<Result> => run(kind, 'reauth');
