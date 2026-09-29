import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, PanResponder, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TabBar from '../components/TabBar';
import Toast from '../components/Toast';
import HomeScreen from '../screens/home/HomeScreen';
import NewsScreen from '../screens/news/NewsScreen';
import ArticleScreen from '../screens/news/ArticleScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import PricesScreen from '../screens/prices/PricesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
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
  // Ekran değişince kaydırma başa döner (key değişir).
  const screenKey = `${nav.tab}:${nav.detailId ?? ''}:${nav.newsId ?? ''}:${nav.vehicleType}:${nav.vehicleBrand ?? ''}:${nav.vehicleModel ?? ''}`;

  // Sekme değişince yeni ekran, sekme sırasına göre sağdan/soldan kayarak girer.
  const slide = useRef(new Animated.Value(0)).current;
  const prevTab = useRef<Tab>(nav.tab);
  useEffect(() => {
    const from = ORDER.indexOf(prevTab.current);
    const to = ORDER.indexOf(nav.tab);
    prevTab.current = nav.tab;
    if (from < 0 || to < 0 || from === to) return;
    slide.setValue(Math.sign(to - from) * width * 0.35);
    Animated.timing(slide, { toValue: 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [nav.tab, width, slide]);

  // Yatay kaydırma: sola → sonraki sekme, sağa → önceki sekme.
  const swipe = useRef({ tab: nav.tab, canSwipe: false, go: nav.go });
  swipe.current = { tab: nav.tab, canSwipe: !nav.detailId && !nav.newsId && ORDER.includes(nav.tab), go: nav.go };
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          swipe.current.canSwipe && Math.abs(g.dx) > 24 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
        onPanResponderRelease: (_, g) => {
          const i = ORDER.indexOf(swipe.current.tab);
          if (g.dx < -60 && i < ORDER.length - 1) swipe.current.go(ORDER[i + 1]);
          else if (g.dx > 60 && i > 0) swipe.current.go(ORDER[i - 1]);
        },
      }),
    [],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <Animated.View style={{ flex: 1, transform: [{ translateX: slide }] }} {...pan.panHandlers}>
        <ScrollView key={screenKey} style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <CurrentScreen />
        </ScrollView>
      </Animated.View>
      <Toast />
      <TabBar />
    </View>
  );
}
