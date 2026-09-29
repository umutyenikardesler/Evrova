import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey,
  authDomain: 'evrova-df707.firebaseapp.com',
  projectId: 'evrova-df707',
  storageBucket: 'evrova-df707.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/** .env doldurulmadıysa uygulama Firebase'siz "demo modunda" çalışır. */
export const isFirebaseConfigured = !!apiKey;

let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  try {
    auth =
      Platform.OS === 'web'
        ? getAuth(app)
        : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    // Fast refresh: auth zaten başlatılmış.
    auth = getAuth(app);
  }
  db = getFirestore(app);
}

export { auth, db };
