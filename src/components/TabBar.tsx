import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useNav, type Tab } from '../navigation/NavContext';
import { colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { blurAvailable, GlassBlur } from './Glass';
import Icon, { type IconName } from './Icon';
import Tap from './Tap';

const TABS: { tab: Tab; icon: IconName; label: 'nav.home' | 'nav.vehicles' | 'nav.news' | 'nav.prices' | 'nav.profile' }[] = [
  { tab: 'home', icon: 'home', label: 'nav.home' },
  { tab: 'vehicles', icon: 'car', label: 'nav.vehicles' },
  { tab: 'news', icon: 'news', label: 'nav.news' },
  { tab: 'prices', icon: 'heart', label: 'nav.prices' },
  { tab: 'profile', icon: 'user', label: 'nav.profile' },
];

const BAR_HEIGHT = 64;
const BUBBLE_W = 56;
const BUBBLE_H = 44;

/** Menü yüksekliği + alt boşluk: içerik bunun kadar alttan boşluk bırakmalı (menünün altında kayar). */
export const TAB_BAR_SPACE = BAR_HEIGHT + 36;

/**
 * Cam efektli (liquid glass) alt menü. Seçili sekmenin arkasındaki "balon" sekme değişirken
 * uzayarak yeni sekmeye kayar ve yerine oturunca seçili ikonun arkasında kalır.
 * `blurTarget`: Android'de bulanıklaştırılacak içerik (BlurTargetView) referansı.
 */
export default function TabBar({ blurTarget }: { blurTarget?: React.RefObject<View | null> }) {
  const { t } = useApp();
  const nav = useNav();
  const { scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const dark = scheme === 'dark';

  const [rowWidth, setRowWidth] = useState(0);
  const slot = rowWidth / TABS.length;
  const index = TABS.findIndex((x) => x.tab === nav.tab);

  // Balon: x (kayma), stretch (uzama 0→1→0), dist (uzama miktarı), visible (bildirimler gibi sekme dışı ekranlarda gizli)
  const x = useRef(new Animated.Value(0)).current;
  const stretch = useRef(new Animated.Value(0)).current;
  const dist = useRef(new Animated.Value(0.4)).current;
  const visible = useRef(new Animated.Value(index >= 0 ? 1 : 0)).current;
  const prev = useRef({ index, slot: 0 });

  useEffect(() => {
    if (slot === 0) return;
    const target = (i: number) => i * slot + (slot - BUBBLE_W) / 2;
    const p = prev.current;
    prev.current = { index, slot };

    if (index < 0) {
      Animated.timing(visible, { toValue: 0, duration: 180, useNativeDriver: true }).start();
      return;
    }
    // İlk yerleşim, gizliyken geri dönüş ya da yeniden ölçüm: animasyonsuz yerleştir
    if (p.slot !== slot || p.index < 0) {
      x.setValue(target(index));
      Animated.timing(visible, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      return;
    }
    if (p.index === index) return;

    dist.setValue(0.35 + 0.22 * Math.min(Math.abs(index - p.index), 4));
    Animated.parallel([
      Animated.timing(x, { toValue: target(index), duration: 520, easing: Easing.bezier(0.25, 0.8, 0.25, 1), useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(stretch, { toValue: 1, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(stretch, { toValue: 0, duration: 320, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true }),
      ]),
    ]).start();
  }, [index, slot, x, stretch, dist, visible]);

  const scaleX = Animated.add(1, Animated.multiply(stretch, dist));
  const scaleY = stretch.interpolate({ inputRange: [0, 1], outputRange: [1, 0.86] });

  const border = dark ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.85)';
  // Bulanıklık yoksa (eski build) içerik okunmasın diye zemin daha opak olur
  const tint = blurAvailable ? (dark ? 'rgba(28,40,58,0.42)' : 'rgba(255,255,255,0.40)') : (dark ? 'rgba(28,40,58,0.93)' : 'rgba(255,255,255,0.93)');

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 16, right: 16, bottom: Math.max(insets.bottom, 12) }}>
      {/* Dış katman: gölge */}
      <View style={{ borderRadius: 32, shadowColor: '#000', shadowOpacity: dark ? 0.45 : 0.18, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 12 }}>
        <View style={{ height: BAR_HEIGHT, borderRadius: 32, overflow: 'hidden', borderWidth: 1, borderColor: border }}>
          {/* Cam: bulanıklık + yarı saydam renk + üstte parlama */}
          <GlassBlur blurTarget={blurTarget} intensity={dark ? 55 : 70} tint={dark ? 'dark' : 'light'} blurMethod="dimezisBlurViewSdk31Plus" style={StyleSheet.absoluteFill} />
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: tint }]} />
          <LinearGradient pointerEvents="none" colors={[dark ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.65)', 'rgba(255,255,255,0)']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: BAR_HEIGHT * 0.55 }} />

          <View style={{ flex: 1, paddingHorizontal: 10, justifyContent: 'center' }}>
            <View onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)} style={{ height: BUBBLE_H, flexDirection: 'row' }}>
              {/* Kayan cam balon */}
              {slot > 0 && (
                <Animated.View pointerEvents="none"
                  style={{
                    position: 'absolute', top: 0, left: 0, width: BUBBLE_W, height: BUBBLE_H, borderRadius: BUBBLE_H / 2, overflow: 'hidden',
                    opacity: visible, transform: [{ translateX: x }, { scaleX }, { scaleY }],
                    backgroundColor: dark ? 'rgba(185,242,39,0.20)' : 'rgba(90,148,0,0.16)',
                    borderWidth: 1, borderColor: dark ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.9)',
                  }}>
                  <LinearGradient colors={['rgba(255,255,255,0.45)', 'rgba(255,255,255,0)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60%' }} />
                </Animated.View>
              )}
              {TABS.map(({ tab, icon, label }) => {
                const on = nav.tab === tab;
                return (
                  <Tap key={tab} onPress={() => nav.go(tab)} accessibilityLabel={t(label)} style={{ flex: 1, height: BUBBLE_H, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={icon} size={22} color={on ? colors.lime : colors.muted} solid={on} detailColor="#FFFFFF" />
                  </Tap>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
