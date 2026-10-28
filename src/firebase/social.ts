import { GoogleAuthProvider, OAuthProvider, signInWithCredential, updateProfile } from 'firebase/auth';
import { Platform } from 'react-native';
import { auth } from './config';

export type SocialKind = 'apple' | 'google';

/** Sağlayıcı bu cihazda/yapılandırmada kullanılamıyor (web, demo modu, eksik client ID, Expo Go). */
export const SOCIAL_UNAVAILABLE = 'social/unavailable';
const unavailable = () => Object.assign(new Error(SOCIAL_UNAVAILABLE), { code: SOCIAL_UNAVAILABLE });

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

/** Apple ile giriş: yalnızca iOS. İptal edilirse false döner. */
async function apple(): Promise<boolean> {
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

  const result = await signInWithCredential(
    auth,
    new OAuthProvider('apple.com').credential({ idToken: credential.identityToken, rawNonce }),
  );
  // Apple adı yalnızca ilk girişte verir.
  const { givenName, familyName } = credential.fullName ?? {};
  const name = [givenName, familyName].filter(Boolean).join(' ');
  if (name && !result.user.displayName) await updateProfile(result.user, { displayName: name });
  return true;
}

/** Google ile giriş: iOS ve Android (development build). İptal edilirse false döner. */
async function google(): Promise<boolean> {
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
  await signInWithCredential(auth, GoogleAuthProvider.credential(res.data.idToken));
  return true;
}

/** Sosyal girişi başlatır; kullanıcı iptal ederse false döner. */
export const signInWithSocial = (kind: SocialKind): Promise<boolean> => (kind === 'apple' ? apple() : google());
