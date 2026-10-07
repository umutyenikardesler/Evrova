import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, PanResponder, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassTarget } from '../components/Glass';
import TabBar, { TAB_BAR_SPACE } from '../components/TabBar';
import Toast from '../components/Toast';
import HomeScreen from '../screens/home/HomeScreen';
import NewsScreen from '../screens/news/NewsScreen';
import ArticleScreen from '../screens/news/ArticleScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import PricesScreen from '../screens/prices/PricesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import TaxScreen from '../screens/tax/TaxScreen';
import VehicleDetailScreen from '../screens/vehicles/VehicleDetailScreen';
import VehiclesScreen from '../screens/vehicles/VehiclesScreen';
import { colors } from '../theme/colors';
import { useNav, type Tab } from './NavContext';

/** Alt menüdeki sıra; kaydırma ve geçiş yönü buna göre belirlenir. */
const ORDER: Tab[] = ['home', 'vehicles', 'news', 'prices', 'profile'];

function CurrentScreen() {
  const nav = useNav();
  if (nav.detailId) return <VehicleDetailScreen id={nav.detailId} />;
  switch (nav.tab) {
    case 'vehicles': return <VehiclesScreen />;
    case 'prices': return <PricesScreen />;
    case 'news': return nav.newsId ? <ArticleScreen id={nav.newsId} /> : <NewsScreen />;
    case 'tax': return <TaxScreen />;
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
  const screenKey = `${nav.tab}:${nav.detailId ?? ''}:${nav.newsId ?? ''}:${nav.vehicleType}:${nav.vehicleBrand ?? ''}:${nav.vehicleModel ?? ''}`;
  const scrollRef = useRef<ScrollView>(null);
  const offsets = useRef<Record<string, number>>({});
  const pendingY = useRef(0);
  const last = useRef({ key: screenKey, tab: nav.tab, depth: nav.depth });
  if (last.current.key !== screenKey) {
    const back = last.current.tab === nav.tab && nav.depth < last.current.depth;
    pendingY.current = back ? offsets.current[screenKey] ?? 0 : 0;
    if (!back) delete offsets.current[screenKey];
    last.current = { key: screenKey, tab: nav.tab, depth: nav.depth };
  }

  // Geçiş animasyonu: sekme değişince sekme sırasına göre, aynı sekmede derinlik değişince (ileri/geri)
  // yeni ekran sağdan/soldan kayarak girer.
  const slide = useRef(new Animated.Value(0)).current;
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
  const navRef = useRef(nav);
  navRef.current = nav;
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 24 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
        onPanResponderRelease: (_, g) => {
          const n = navRef.current;
          const i = ORDER.indexOf(n.tab);
          if (g.dx > 60) {
            if (!n.goBack() && i > 0) n.go(ORDER[i - 1]);
          } else if (g.dx < -60 && !n.canGoBack && i >= 0 && i < ORDER.length - 1) n.go(ORDER[i + 1]);
        },
      }),
    [],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      {/* İçerik menünün arkasından akar; menü cam efektiyle bunu bulanık gösterir */}
      <GlassTarget ref={blurTarget} style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, transform: [{ translateX: slide }] }} {...pan.panHandlers}>
          <ScrollView key={screenKey} ref={scrollRef} style={{ flex: 1 }} scrollEventThrottle={32}
            onScroll={(e) => { offsets.current[screenKey] = e.nativeEvent.contentOffset.y; }}
            onContentSizeChange={() => { if (pendingY.current > 0) { scrollRef.current?.scrollTo({ y: pendingY.current, animated: false }); pendingY.current = 0; } }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE + Math.max(insets.bottom, 12) }}>
            <CurrentScreen />
          </ScrollView>
        </Animated.View>
      </GlassTarget>
      <Toast />
      <TabBar blurTarget={blurTarget} />
    </View>
  );
}
