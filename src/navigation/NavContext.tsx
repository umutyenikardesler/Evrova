import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import { useApp } from '../context/AppContext';
import type { VehicleType } from '../types';
import { brandOf, modelOf } from '../utils/brand';
import { onNotificationOpened, type NotificationTarget } from '../services/notifications';

export type Tab = 'home' | 'vehicles' | 'news' | 'prices' | 'profile' | 'notif' | 'tax' | 'charging';

/** Alt menüdeki sıra; yatay kaydırma ve geçiş yönü buna göre belirlenir. */
export const TAB_ORDER: Tab[] = ['home', 'vehicles', 'news', 'prices', 'profile'];

interface NavState {
  tab: Tab;
  detailId: string | null;
  /** Fiyat takibi, Ana sayfadaki "Takip ettiklerin" listesinden açıldı (parmakla geri önce aracın detayına gider). */
  pricesViaWatch: boolean;
  /** Detay, o fiyat sayfasından geri hareketiyle açıldı (parmakla geri önceki sekmeye, geri oku paket → model → marka listesine gider). */
  detailViaBack: boolean;
  newsId: string | null;
  priceSel: string | null;
  monthSel: number;
  vehicleType: 'all' | VehicleType;
  vehicleBrand: string | null;
  vehicleModel: string | null;
  /** Haberler sayfasında seçili kategori ('all' = Tümü) ve sayfa numarası. */
  newsCat: string;
  newsPage: number;
}

interface Nav extends NavState {
  go: (tab: Tab, extra?: Partial<NavState>) => void;
  openDetail: (id: string) => void;
  closeDetail: () => void;
  openNews: (id: string) => void;
  closeArticle: () => void;
  /** Fiyat takibini aracı seçili açar; `viaWatch`: Ana sayfadaki takip listesinden (geri hareketi önce detaya gider). */
  openPrices: (vehicleId: string, opts?: { viaWatch?: boolean }) => void;
  setPriceSel: (id: string) => void;
  setMonthSel: (i: number) => void;
  setVehicleType: (t: 'all' | VehicleType) => void;
  setVehicleBrand: (b: string | null) => void;
  setVehicleModel: (m: string | null) => void;
  setNewsCat: (c: string) => void;
  setNewsPage: (p: number) => void;
  /** Bir üst seviyeye döner (detay → paketler → modeller → markalar; makale → haberler; bildirimler → ana sayfa). Geri gidilecek seviye yoksa false. */
  goBack: () => boolean;
  /** Geri gidilecek bir üst seviye var mı? */
  canGoBack: boolean;
  /** Sayfa derinliği (geçiş animasyonunun yönü için). */
  depth: number;
}

/** Bir üst seviyedeki durum; geri gidilecek seviye yoksa null. */
function parentOf(p: NavState): NavState | null {
  // Fiyat takibinden geriyle açılan detayın geri adımı: sekme sırasında bir önceki sekme (devam eden sayfa geçişi).
  if (p.detailId && p.detailViaBack) return { ...p, detailId: null, detailViaBack: false, tab: TAB_ORDER[Math.max(TAB_ORDER.indexOf('prices') - 1, 0)] };
  if (p.detailId) return { ...p, detailId: null };
  if (p.newsId) return { ...p, newsId: null };
  if (p.tab === 'vehicles' && p.vehicleModel) return { ...p, vehicleModel: null };
  if (p.tab === 'vehicles' && p.vehicleBrand) return { ...p, vehicleBrand: null };
  if (p.tab === 'notif' || p.tab === 'tax' || p.tab === 'charging') return { ...p, tab: 'home' };
  return null;
}

const depthOf = (p: NavState) =>
  (p.detailId ? (p.detailViaBack ? -1 : 1) : 0) + (p.newsId ? 1 : 0) + (p.tab === 'vehicles' ? (p.vehicleBrand ? 1 : 0) + (p.vehicleModel ? 1 : 0) : 0) + (p.tab === 'notif' || p.tab === 'tax' || p.tab === 'charging' ? 1 : 0);

/** Takip listesinden açılan fiyat sayfasında geri: önce seçili aracın detayına gider (bir sonraki geri sekme sırasında devam eder). */
function priceBack(p: NavState, target: string | null): NavState | null {
  if (p.tab === 'prices' && p.pricesViaWatch && !p.detailId && target) return { ...p, detailId: target, detailViaBack: true };
  return null;
}

const initial: NavState = { tab: 'home', detailId: null, detailViaBack: false, pricesViaWatch: false, newsId: null, priceSel: 'togg-t10x-std', monthSel: 11, vehicleType: 'all', vehicleBrand: null, vehicleModel: null, newsCat: 'all', newsPage: 1 };
const Ctx = createContext<Nav | null>(null);

export const useNav = (): Nav => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useNav must be used inside <NavProvider>');
  return v;
};

export function NavProvider({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  const [s, setS] = useState<NavState>(initial);
  const sRef = useRef(s);
  useEffect(() => { sRef.current = s; }, [s]);

  // Fiyat takibi ekranındaki seçili araç (PricesScreen ile aynı kural): seçili takipteyse o, değilse listedeki ilk.
  const { profile, vehicles } = useApp();
  const watchedIds = (profile?.watch ?? []).filter((id) => vehicles.some((v) => v.id === id));
  const priceTarget = (s.priceSel && watchedIds.includes(s.priceSel) ? s.priceSel : watchedIds[0]) ?? null;
  const targetRef = useRef(priceTarget);
  useEffect(() => { targetRef.current = priceTarget; }, [priceTarget]);

  const go = useCallback<Nav['go']>((tab, extra) => setS((p) => ({ ...p, tab, detailId: null, detailViaBack: false, pricesViaWatch: false, newsId: null, ...extra })), []);
  const openNews = useCallback((id: string) => setS((p) => ({ ...p, tab: 'news', newsId: id, detailId: null, detailViaBack: false })), []);
  const openPrices = useCallback<Nav['openPrices']>((id, opts) => go('prices', { priceSel: id, monthSel: 11, pricesViaWatch: !!opts?.viaWatch }), [go]);

  // Çıkış yapınca / giriş yapınca başlangıç ekranına dön
  const [prevEnabled, setPrevEnabled] = useState(enabled);
  if (prevEnabled !== enabled) {
    setPrevEnabled(enabled);
    setS(initial);
  }

  const goBack = useCallback(() => {
    const parent = parentOf(sRef.current) ?? priceBack(sRef.current, targetRef.current);
    if (!parent) return false;
    setS(parent);
    return true;
  }, []);

  // Detayın sol üstteki geri oku. Fiyat sayfasından geriyle açılan detayda, aracın paket listesine gider
  // (tek paketli modelde paket listesi yoktur, model listesine); oradan geri model, sonra marka listesine çıkar.
  const vehiclesRef = useRef(vehicles);
  useEffect(() => { vehiclesRef.current = vehicles; }, [vehicles]);
  const closeDetail = useCallback(() => {
    setS((p) => {
      const v = p.detailViaBack ? vehiclesRef.current.find((x) => x.id === p.detailId) : undefined;
      if (!v) return { ...p, detailId: null, detailViaBack: false };
      const brand = brandOf(v), model = modelOf(v);
      const versions = vehiclesRef.current.filter((x) => brandOf(x) === brand && modelOf(x) === model).length;
      return {
        ...p, tab: 'vehicles', detailId: null, detailViaBack: false, pricesViaWatch: false,
        vehicleType: 'all', vehicleBrand: brand, vehicleModel: versions > 1 ? model : null,
      };
    });
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
      openDetail: (id) => setS((p) => ({ ...p, detailId: id, detailViaBack: false })),
      closeDetail,
      closeArticle: () => setS((p) => ({ ...p, newsId: null })),
      setPriceSel: (id) => setS((p) => ({ ...p, priceSel: id, monthSel: 11 })),
      setMonthSel: (i) => setS((p) => ({ ...p, monthSel: i })),
      setVehicleType: (t) => setS((p) => ({ ...p, vehicleType: t, vehicleBrand: null, vehicleModel: null })),
      setVehicleBrand: (b) => setS((p) => ({ ...p, vehicleBrand: b, vehicleModel: null })),
      setVehicleModel: (m) => setS((p) => ({ ...p, vehicleModel: m })),
      setNewsCat: (c) => setS((p) => ({ ...p, newsCat: c, newsPage: 1 })),
      setNewsPage: (n) => setS((p) => ({ ...p, newsPage: n })),
      goBack, canGoBack: parentOf(s) !== null, depth: depthOf(s),
    }),
    [s, go, openNews, openPrices, goBack, closeDetail],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
