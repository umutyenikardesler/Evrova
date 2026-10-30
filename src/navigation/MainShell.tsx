import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Animated, Easing, PanResponder, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassTarget } from '../components/Glass';
import TabBar, { TAB_BAR_SPACE } from '../components/TabBar';
import Toast from '../components/Toast';
import HomeHeader from '../screens/home/HomeHeader';
import HomeScreen from '../screens/home/HomeScreen';
import NewsScreen from '../screens/news/NewsScreen';
import ArticleScreen from '../screens/news/ArticleScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import PricesScreen from '../screens/prices/PricesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ChargingScreen from '../screens/charging/ChargingScreen';
import TaxScreen from '../screens/tax/TaxScreen';
import VehicleDetailScreen from '../screens/vehicles/VehicleDetailScreen';
import VehiclesScreen from '../screens/vehicles/VehiclesScreen';
import { colors } from '../theme/colors';
import { TAB_ORDER as ORDER, useNav } from './NavContext';
import { ScrollYContext } from './ScrollContext';
import { isSwipeLocked } from './swipeLock';

/** Olay işleyicilerinin (kaydırma, yatay çekme) okuduğu güncel değerler; ekranda tek MainShell bulunur. */
const live = { key: '', nav: null as ReturnType<typeof useNav> | null, offsets: {} as Record<string, number> };

function CurrentScreen() {
  const nav = useNav();
  if (nav.detailId) return <VehicleDetailScreen id={nav.detailId} />;
  switch (nav.tab) {
    case 'vehicles': return <VehiclesScreen />;
    case 'prices': return <PricesScreen />;
    case 'news': return nav.newsId ? <ArticleScreen id={nav.newsId} /> : <NewsScreen />;
    case 'tax': return <TaxScreen />;
    case 'charging': return <ChargingScreen />;
    case 'notif': return <NotificationsScreen />;
    case 'profile': return <ProfileScreen />;
    default: return <HomeScreen />;
  }
}

/** Giriş yapmış kullanıcı için: içerik alanı + alt sekme çubuğu. */
export default function MainShell() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const blurTarget = useRef<View>(null); // Android: menünün bulanıklaştıracağı içerik
  // Ekran değişince kaydırma başa döner (key değişir); aynı sekmede geri gidilirse o ekranın eski konumu geri yüklenir.
  const screenKey = `${nav.tab}:${nav.detailId ?? ''}:${nav.newsId ?? ''}:${nav.vehicleType}:${nav.vehicleBrand ?? ''}:${nav.vehicleModel ?? ''}:${nav.newsCat}:${nav.newsPage}`;
  const scrollRef = useRef<ScrollView>(null);
  const [scrollY] = useState(() => new Animated.Value(0));
  useEffect(() => { scrollY.setValue(0); }, [screenKey, scrollY]);
  const [onScroll] = useState(() => Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: true,
    listener: (e: { nativeEvent: { contentOffset: { y: number } } }) => { live.offsets[live.key] = e.nativeEvent.contentOffset.y; },
  }));
  const pendingY = useRef(0);
  const last = useRef({ key: screenKey, tab: nav.tab, depth: nav.depth });
  // Ekran değiştiğinde (yeni ScrollView içerik ölçülmeden önce) hedef kaydırma konumunu belirle.
  useLayoutEffect(() => {
    live.key = screenKey;
    if (last.current.key === screenKey) return;
    const back = last.current.tab === nav.tab && nav.depth < last.current.depth;
    pendingY.current = back ? live.offsets[screenKey] ?? 0 : 0;
    if (!back) delete live.offsets[screenKey];
    last.current = { key: screenKey, tab: nav.tab, depth: nav.depth };
  }, [screenKey, nav.tab, nav.depth]);

  // Geçiş animasyonu: sekme değişince sekme sırasına göre, aynı sekmede derinlik değişince (ileri/geri)
  // yeni ekran sağdan/soldan kayarak girer.
  const [slide] = useState(() => new Animated.Value(0));
  const prev = useRef({ tab: nav.tab, depth: nav.depth });
  useEffect(() => {
    const p = prev.current;
    prev.current = { tab: nav.tab, depth: nav.depth };
    let dir = 0;
    if (p.tab !== nav.tab) {
      const from = ORDER.indexOf(p.tab), to = ORDER.indexOf(nav.tab);
      // Bildirimlerden ana sayfaya dönüş "geri" sayılır.
      dir = from < 0 || to < 0 ? (nav.depth < p.depth ? -1 : 1) : Math.sign(to - from);
    } else dir = Math.sign(nav.depth - p.depth);
    if (!dir) return;
    slide.setValue(dir * width * 0.35);
    Animated.timing(slide, { toValue: 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [nav.tab, nav.depth, width, slide]);

  // Yatay kaydırma:
  //  - sağa çek: önce bir üst seviyeye geri (detay → paketler → modeller → markalar), üst seviye yoksa önceki sekme
  //  - sola çek: sonraki sekme (yalnızca en üst seviyede)
  useEffect(() => { live.nav = nav; }, [nav]);
  const [pan] = useState(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => !isSwipeLocked() && Math.abs(g.dx) > 24 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
    onPanResponderRelease: (_, g) => {
      if (isSwipeLocked()) return;
      const n = live.nav;
      if (!n) return;
      const i = ORDER.indexOf(n.tab);
      if (g.dx > 60) {
        if (!n.goBack() && i > 0) n.go(ORDER[i - 1]);
      } else if (g.dx < -60 && !n.canGoBack && i >= 0 && i < ORDER.length - 1) n.go(ORDER[i + 1]);
    },
  }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      {/* İçerik menünün arkasından akar; menü cam efektiyle bunu bulanık gösterir */}
      <GlassTarget ref={blurTarget} style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, transform: [{ translateX: slide }] }} {...pan.panHandlers}>
          {nav.tab === 'home' && !nav.detailId && <HomeHeader />}
          <Animated.ScrollView key={screenKey} ref={scrollRef} style={{ flex: 1 }} scrollEventThrottle={16}
            onScroll={onScroll}
            onContentSizeChange={() => { if (pendingY.current > 0) { scrollRef.current?.scrollTo({ y: pendingY.current, animated: false }); pendingY.current = 0; } }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE + Math.max(insets.bottom, 12) }}>
            <ScrollYContext.Provider value={scrollY}>
              <CurrentScreen />
            </ScrollYContext.Provider>
          </Animated.ScrollView>
        </Animated.View>
      </GlassTarget>
      <Toast />
      <TabBar blurTarget={blurTarget} />
    </View>
  );
}
