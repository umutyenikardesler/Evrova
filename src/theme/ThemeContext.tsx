import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useApp } from '../context/AppContext';
import { applyScheme, type Scheme } from './colors';

export type ThemeMode = 'system' | 'light' | 'dark';
const KEY = 'evrova.theme';

interface ThemeState {
  mode: ThemeMode;
  scheme: Scheme;
  setMode: (m: ThemeMode) => void;
}

const Ctx = createContext<ThemeState | null>(null);

export function useTheme(): ThemeState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme must be used inside <ThemeProvider>');
  return v;
}

/** Açık/koyu tema. Giriş ekranı (neon gece sahnesi) her zaman koyudur. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v === 'system' || v === 'light' || v === 'dark') setModeState(v);
    });
  }, []);

  const chosen: Scheme = mode === 'system' ? (system === 'light' ? 'light' : 'dark') : mode;
  const scheme: Scheme = user ? chosen : 'dark';
  applyScheme(scheme); // çocuklar render edilmeden önce renkler güncellenir

  const value = useMemo<ThemeState>(
    () => ({
      mode, scheme,
      setMode: (m) => {
        setModeState(m);
        AsyncStorage.setItem(KEY, m).catch(() => {});
      },
    }),
    [mode, scheme],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
