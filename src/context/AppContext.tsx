import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { NEWS } from '../data/news';
import { localNotifications } from '../data/notifications';
import { LIST_MONTH, VEHICLES } from '../data/vehicles';
import { resetPassword, signIn, signOut, signUp, subscribeAuth, type AuthUser } from '../firebase/auth';
import { saveUser, watchNews, watchNotifications, watchUser, watchVehicles } from '../firebase/firestore';
import { translate, type Lang, type TKey } from '../i18n';
import { ensurePermission, getPushTokens } from '../services/notifications';
import type { AppNotification, NewsItem, UserProfile, Vehicle } from '../types';
import { cachedRates, refreshRates } from '../services/rates';
import { FALLBACK_RATES, type Currency, type Rates } from '../utils/currency';
import { formatPrice } from '../utils/format';
import { capitalizeName, splitName } from '../utils/name';

const LANG_KEY = 'evrova.lang';

const defaultLang = (): Lang => (getLocales()[0]?.languageCode === 'tr' ? 'tr' : 'en');

const defaultProfile = (user: AuthUser, lang: Lang): UserProfile => ({
  name: user.displayName,
  ...splitName(user.displayName),
  email: user.email,
  watch: ['togg-t10x-std', 'tesla-model-y', 'ford-e-transit-custom'],
  alarms: { 'togg-t10x-std': true },
  readNotifs: ['a4', 'a5'],
  notif: true,
  compact: false,
  currency: 'TRY',
  lang,
});

interface AppState {
  lang: Lang;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
  setLang: (l: Lang) => void;

  authReady: boolean;
  user: AuthUser | null;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  updateName: (firstName: string, lastName: string) => void;
  sendReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;

  vehicles: Vehicle[];
  /** Fiyat listesinin ayı ("YYYY-MM"): verideki en yeni liste */
  listMonth: string;
  news: NewsItem[];
  notifications: AppNotification[];

  isWatched: (id: string) => boolean;
  toggleWatch: (id: string) => void;
  toggleAlarm: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  toggleCompact: () => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: Rates;
  toggleNotif: () => Promise<void>;
  price: (n: number) => string;

  toast: string | null;
  showToast: (msg: string) => void;
}

const Ctx = createContext<AppState | null>(null);

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside <AppProvider>');
  return v;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(defaultLang());
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>(VEHICLES);
  const [news, setNews] = useState<NewsItem[]>(NEWS);
  const [notifications, setNotifications] = useState<AppNotification[]>(localNotifications);
  const [rates, setRates] = useState<Rates>(FALLBACK_RATES);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const langRef = useRef(lang);
  langRef.current = lang;

  const t = useCallback<AppState['t']>((key, vars) => translate(lang, key, vars), [lang]);

  const showToast = useCallback((msg: string) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  // Döviz kurları: önce kayıtlı, sonra (gerekirse) güncel kur
  useEffect(() => {
    cachedRates().then(setRates);
    refreshRates().then((r) => r && setRates(r));
  }, []);

  // Kayıtlı dil
  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((v) => {
      if (v === 'tr' || v === 'en') setLangState(v);
    });
  }, []);

  // Firebase Auth
  useEffect(() => {
    return subscribeAuth((u) => {
      setUser(u);
      if (!u) setProfile(null);
      setAuthReady(true);
    });
  }, []);

  // Herkese açık veriler (Firestore boşsa yerel veri kalır)
  useEffect(() => {
    const unsubs = [watchVehicles(setVehicles), watchNews(setNews), watchNotifications(setNotifications)];
    return () => unsubs.forEach((u) => u());
  }, []);

  // Kullanıcı profili (Firestore) — demo modunda yalnızca yerel
  const uid = user?.uid;
  useEffect(() => {
    if (!user) return;
    setProfile((p) => p ?? defaultProfile(user, langRef.current));
    if (user.uid === 'demo') return;
    let created = false;
    return watchUser(user.uid, (remote) => {
      if (remote) setProfile((p) => ({ ...(p ?? defaultProfile(user, langRef.current)), ...remote }) as UserProfile);
      else if (!created) {
        created = true;
        saveUser(user.uid, defaultProfile(user, langRef.current));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // Bildirim izni + push token kaydı
  const notifOn = profile?.notif;
  useEffect(() => {
    if (!uid || uid === 'demo' || !notifOn) return;
    (async () => {
      if (!(await ensurePermission())) return;
      const tokens = await getPushTokens();
      if (tokens.expoPushToken || tokens.devicePushToken) await saveUser(uid, { ...tokens });
    })();
  }, [uid, notifOn]);

  const update = useCallback(
    (patch: Partial<UserProfile>) => {
      setProfile((p) => (p ? { ...p, ...patch } : p));
      if (uid && uid !== 'demo') saveUser(uid, patch);
    },
    [uid],
  );

  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      AsyncStorage.setItem(LANG_KEY, l).catch(() => {});
      if (profile) update({ lang: l });
    },
    [profile, update],
  );

  const value = useMemo<AppState>(() => {
    const p = profile;
    return {
      lang, t, setLang,
      authReady, user, profile,
      login: signIn,
      register: (f, l, email, pw) => signUp(`${capitalizeName(f)} ${capitalizeName(l)}`, email, pw),
      updateName: (f, l) => {
        const firstName = capitalizeName(f), lastName = capitalizeName(l);
        update({ firstName, lastName, name: `${firstName} ${lastName}`.trim() });
      },
      sendReset: resetPassword,
      logout: signOut,
      vehicles, listMonth: vehicles.find((v) => v.listMonth)?.listMonth ?? LIST_MONTH, news, notifications,
      isWatched: (id) => !!p?.watch.includes(id),
      toggleWatch: (id) => {
        if (!p) return;
        update({ watch: p.watch.includes(id) ? p.watch.filter((x) => x !== id) : [...p.watch, id] });
      },
      toggleAlarm: (id) => p && update({ alarms: { ...p.alarms, [id]: !p.alarms[id] } }),
      markRead: (id) => p && !p.readNotifs.includes(id) && update({ readNotifs: [...p.readNotifs, id] }),
      markAllRead: () => update({ readNotifs: notifications.map((n) => n.id) }),
      toggleCompact: () => p && update({ compact: !p.compact }),
      currency: p?.currency ?? 'TRY',
      setCurrency: (c) => update({ currency: c }),
      rates,
      toggleNotif: async () => {
        if (!p) return;
        if (p.notif) {
          update({ notif: false });
          return showToast(t('profile.notifOff'));
        }
        if (uid !== 'demo' && !(await ensurePermission())) return showToast(t('profile.permDenied'));
        update({ notif: true });
        showToast(t('profile.notifOn'));
      },
      price: (n) => formatPrice(n, lang, !!p?.compact, p?.currency ?? 'TRY', rates),
      toast, showToast,
    };
  }, [lang, t, setLang, rates, authReady, user, profile, vehicles, news, notifications, update, toast, showToast, uid]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
