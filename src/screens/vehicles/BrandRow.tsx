import React from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import Icon from '../../components/Icon';
import Tap from '../../components/Tap';
import { colors } from '../../theme/colors';

/** Marka listesindeki satır: baş harf, marka adı, model sayısı. */
export default function BrandRow({ brand, count, onPress }: { brand: string; count: string; onPress: () => void }) {
  return (
    <Tap onPress={onPress} pressedBg={colors.card2}
      style={{ backgroundColor: colors.card, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 }}>
      <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.limeSoft, alignItems: 'center', justifyContent: 'center' }}>
        <AppText weight="extrabold" size={24} color={colors.lime}>{brand.charAt(0).toUpperCase()}</AppText>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText weight="bold" size={17}>{brand}</AppText>
        <AppText size={12} color={colors.muted}>{count}</AppText>
      </View>
      <Icon name="chevron" size={20} color={colors.muted} />
    </Tap>
  );
}
