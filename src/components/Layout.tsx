import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import AppText from './AppText';

/** Sayfa başlığı (28px extrabold). */
export function ScreenTitle({ children }: { children: string }) {
  return <AppText weight="extrabold" size={28} style={{ letterSpacing: -0.56 }}>{children}</AppText>;
}

/** Sayfa içeriği kapsayıcısı: 18px yan boşluk, 16px aralık. */
export function Page({ children, top = 10, bottom = 24 }: { children: React.ReactNode; top?: number; bottom?: number }) {
  return <View style={{ paddingHorizontal: 18, paddingTop: top, paddingBottom: bottom, gap: 16 }}>{children}</View>;
}

/** Kart yüzeyi. */
export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ backgroundColor: colors.card, borderRadius: 20 }, style]}>{children}</View>;
}

/** Fotoğraf yer tutucusu (tasarımdaki gri kutu). */
export function PhotoPlaceholder({ label, height, radius = 22, bg = colors.card }: { label: string; height: number; radius?: number; bg?: string }) {
  return (
    <View style={{ height, borderRadius: radius, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <AppText size={11} weight="semibold" color={colors.muted} style={{ fontFamily: undefined }}>{label}</AppText>
    </View>
  );
}

/** Küçük büyük harfli kategori etiketi. */
export function Eyebrow({ children }: { children: string }) {
  return <AppText weight="bold" size={11} color={colors.lime} style={{ letterSpacing: 0.88, textTransform: 'uppercase' }}>{children}</AppText>;
}
