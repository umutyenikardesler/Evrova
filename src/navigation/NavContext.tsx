import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
}

const initial: NavState = { tab: 'home', detailId: null, newsId: null, priceSel: 'togg-t10x-std', monthSel: 11, vehicleType: 'all', vehicleBrand: null, vehicleModel: null };
const Ctx = createContext<Nav | null>(null);

export const useNav = (): Nav => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useNav must be used inside <NavProvider>');
  return v;
};

export function NavProvider({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  const [s, setS] = useState<NavState>(initial);

  const go = useCallback<Nav['go']>((tab, extra) => setS((p) => ({ ...p, tab, detailId: null, newsId: null, ...extra })), []);
  const openNews = useCallback((id: string) => setS((p) => ({ ...p, tab: 'news', newsId: id, detailId: null })), []);
  const openPrices = useCallback((id: string) => go('prices', { priceSel: id, monthSel: 11 }), [go]);

  // Çıkış yapınca / giriş yapınca başlangıç ekranına dön
  useEffect(() => {
    setS(initial);
  }, [enabled]);

  // Android geri tuşu: detay → liste → ana sayfa → çık
  useEffect(() => {
    if (!enabled) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (s.detailId) return setS((p) => ({ ...p, detailId: null })), true;
      if (s.newsId) return setS((p) => ({ ...p, newsId: null })), true;
      if (s.tab === 'vehicles' && s.vehicleModel) return setS((p) => ({ ...p, vehicleModel: null })), true;
      if (s.tab === 'vehicles' && s.vehicleBrand) return setS((p) => ({ ...p, vehicleBrand: null })), true;
      if (s.tab !== 'home') return go('home'), true;
      return false;
    });
    return () => sub.remove();
  }, [enabled, s.detailId, s.newsId, s.tab, s.vehicleBrand, s.vehicleModel, go]);

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
    }),
    [s, go, openNews, openPrices],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
