import React from 'react';
import { ScrollView, View } from 'react-native';
import { colors } from '../theme/colors';
import AppText from './AppText';
import Tap from './Tap';

export interface ChipItem {
  key: string;
  label: string;
  active: boolean;
  onPress: () => void;
}

/** Yatay kaydırılabilir chip satırı (sayfa kenarlarına taşan). */
export function ChipScroller({ items, fade = false }: { items: ChipItem[]; fade?: boolean }) {
  return (
    <View style={{ marginHorizontal: -18 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, gap: 8 }}>
        {items.map((c) => (
          <Tap key={c.key} onPress={c.onPress}
            style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: c.active ? colors.lime : colors.card }}>
            <AppText weight="bold" size={13} color={c.active ? colors.bg : colors.ink}>{c.label}</AppText>
          </Tap>
        ))}
        {fade && <View style={{ width: 10 }} />}
      </ScrollView>
    </View>
  );
}

/** Eşit genişlikli filtre butonları (Araçlar sayfası). */
export function ChipRow({ items }: { items: ChipItem[] }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {items.map((c) => (
        <Tap key={c.key} onPress={c.onPress}
          style={{ flexGrow: 1, flexShrink: 1, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 12, alignItems: 'center', backgroundColor: c.active ? colors.lime : colors.card }}>
          <AppText weight="bold" size={12.5} numberOfLines={1} color={c.active ? colors.bg : colors.ink}>{c.label}</AppText>
        </Tap>
      ))}
    </View>
  );
}

/** Küçük yuvarlak etiket (tür, slogan, kategori). */
export function Pill({ label, tone = 'lime' }: { label: string; tone?: 'lime' | 'card' }) {
  return (
    <View style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: tone === 'lime' ? colors.limeSoft : colors.card }}>
      <AppText weight={tone === 'lime' ? 'bold' : 'semibold'} size={12} color={tone === 'lime' ? colors.lime : colors.muted}>{label}</AppText>
    </View>
  );
}
