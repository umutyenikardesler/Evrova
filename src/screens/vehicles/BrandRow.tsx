import React from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import BrandLogo from '../../components/BrandLogo';
import VehiclePhoto from '../../components/VehiclePhoto';
import type { VehicleImage } from '../../data/vehicleImages';
import Icon from '../../components/Icon';
import Tap from '../../components/Tap';
import { colors } from '../../theme/colors';

/** Marka (logolu) ya da model satırı. Model satırında logoBrand verilirse üst markanın logosu gösterilir. */
export default function BrandRow({ brand, count, onPress, logoBrand, type, image }: { brand: string; count: string; onPress: () => void; logoBrand?: string; type?: string; image?: VehicleImage }) {
  return (
    <Tap onPress={onPress} pressedBg={colors.card2}
      style={{ backgroundColor: colors.card, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 }}>
      {image ? <VehiclePhoto image={image} /> : <BrandLogo brand={logoBrand ?? brand} type={type} />}
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText weight="bold" size={17}>{brand}</AppText>
        <AppText size={12} color={colors.muted}>{count}</AppText>
      </View>
      <Icon name="chevron" size={20} color={colors.muted} />
    </Tap>
  );
}
