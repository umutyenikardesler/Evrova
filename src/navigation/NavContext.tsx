import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import type { VehicleType } from '../types';
import { onNotificationOpened, type NotificationTarget } from '../services/notifications';

export type Tab = 'home' | 'vehicles' | 'news' | 'prices' | 'profile' | 'notif';

interface NavState {
  tab: Tab;
  detailId: string | null;
  newsId: string | null;
  priceSel: string | null;
  monthSel: number;
  vehicleType: 'all' | VehicleType;
  vehicleBrand: string | null;
  vehicleModel: string | null;
}

interface Nav extends NavState {
  go: (tab: Tab, extra?: Partial<NavState>) => void;
  openDetail: (id: string) => void;
  closeDetail: () => void;
  openNews: (id: string) => void;
  closeArticle: () => void;
  openPrices: (vehicleId: string) => void;
  setPriceSel: (id: string) => void;
  setMonthSel: (i: number) => void;
  setVehicleType: (t: 'all' | VehicleType) => void;
  setVehicleBrand: (b: string | null) => void;
  setVehicleModel: (m: string | null) => void;
  /** Bir üst seviyeye döner (detay → paketler → modeller → markalar; makale → haberler; bildirimler → ana sayfa). Geri gidilecek seviye yoksa false. */
  goBack: () => boolean;
  /** Geri gidilecek bir üst seviye var mı? */
  canGoBack: boolean;
  /** Sayfa derinliği (geçiş animasyonunun yönü için). */
  depth: number;
}

/** Bir üst seviyedeki durum; geri gidilecek seviye yoksa null. */
function parentOf(p: NavState): NavState | null {
  if (p.detailId) return { ...p, detailId: null };
  if (p.newsId) return { ...p, newsId: null };
  if (p.tab === 'vehicles' && p.vehicleModel) return { ...p, vehicleModel: null };
  if (p.tab === 'vehicles' && p.vehicleBrand) return { ...p, vehicleBrand: null };
  if (p.tab === 'notif') return { ...p, tab: 'home' };
  return null;
}

const depthOf = (p: NavState) =>
  (p.detailId ? 1 : 0) + (p.newsId ? 1 : 0) + (p.tab === 'vehicles' ? (p.vehicleBrand ? 1 : 0) + (p.vehicleModel ? 1 : 0) : 0) + (p.tab === 'notif' ? 1 : 0);

const initial: NavState = { tab: 'home', detailId: null, newsId: null, priceSel: 'togg-t10x-std', monthSel: 11, vehicleType: 'all', vehicleBrand: null, vehicleModel: null };
const Ctx = createContext<Nav | null>(null);

export const useNav = (): Nav => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useNav must be used inside <NavProvider>');
  return v;
};

export function NavProvider({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  const [s, setS] = useState<NavState>(initial);
  const sRef = useRef(s);
  sRef.current = s;

  const go = useCallback<Nav['go']>((tab, extra) => setS((p) => ({ ...p, tab, detailId: null, newsId: null, ...extra })), []);
  const openNews = useCallback((id: string) => setS((p) => ({ ...p, tab: 'news', newsId: id, detailId: null })), []);
  const openPrices = useCallback((id: string) => go('prices', { priceSel: id, monthSel: 11 }), [go]);

  // Çıkış yapınca / giriş yapınca başlangıç ekranına dön
  useEffect(() => {
    setS(initial);
  }, [enabled]);

  const goBack = useCallback(() => {
    const parent = parentOf(sRef.current);
    if (!parent) return false;
    setS(parent);
    return true;
  }, []);

  // Android geri tuşu: bir üst seviye → (üst seviye yoksa) ana sayfa → çık
  useEffect(() => {
    if (!enabled) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (goBack()) return true;
      if (sRef.current.tab !== 'home') return go('home'), true;
      return false;
    });
    return () => sub.remove();
  }, [enabled, goBack, go]);

  // Push bildirimine dokununca ilgili ekrana git
  useEffect(() => {
    if (!enabled) return;
    return onNotificationOpened((target: NotificationTarget) => {
      if (target.newsId) openNews(target.newsId);
      else if (target.vehicleId) openPrices(target.vehicleId);
      else go('notif');
    });
  }, [enabled, go, openNews, openPrices]);

  const value = useMemo<Nav>(
    () => ({
      ...s, go, openNews, openPrices,
      openDetail: (id) => setS((p) => ({ ...p, detailId: id })),
      closeDetail: () => setS((p) => ({ ...p, detailId: null })),
      closeArticle: () => setS((p) => ({ ...p, newsId: null })),
      setPriceSel: (id) => setS((p) => ({ ...p, priceSel: id, monthSel: 11 })),
      setMonthSel: (i) => setS((p) => ({ ...p, monthSel: i })),
      setVehicleType: (t) => setS((p) => ({ ...p, vehicleType: t, vehicleBrand: null, vehicleModel: null })),
      setVehicleBrand: (b) => setS((p) => ({ ...p, vehicleBrand: b, vehicleModel: null })),
      setVehicleModel: (m) => setS((p) => ({ ...p, vehicleModel: m })),
      goBack, canGoBack: parentOf(s) !== null, depth: depthOf(s),
    }),
    [s, go, openNews, openPrices, goBack],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
