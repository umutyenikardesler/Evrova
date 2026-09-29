import type { Persistence } from 'firebase/auth';

// firebase/auth'ın React Native sürümünde bulunan, ama varsayılan tip
// tanımlarında görünmeyen fonksiyon.
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
