import React from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import { HeartButton } from '../../components/Buttons';
import { Eyebrow } from '../../components/Layout';
import Tap from '../../components/Tap';
import VehicleTypeIcon from '../../components/VehicleTypeIcon';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import type { Vehicle } from '../../types';
import { formatBattery } from '../../utils/format';

export default function VehicleCard({ vehicle, onPress, title }: { vehicle: Vehicle; onPress: () => void; title?: string }) {
  const { t, lang, price, isWatched, toggleWatch } = useApp();
  const range = vehicle.rangeKm ? `${vehicle.rangeKm} km` : '';
  const battery = vehicle.batteryKwh ? formatBattery(vehicle.batteryKwh, lang) : '';
  const summary = range && battery ? t('vehicles.rangeLine', { range, battery }) : range ? t('vehicles.rangeOnly', { range }) : battery;
  return (
    <Tap onPress={onPress} pressedBg={colors.card2}
      style={{ backgroundColor: colors.card, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 }}>
      <VehicleTypeIcon type={vehicle.type} />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Eyebrow>{t(`types.${vehicle.type}`)}</Eyebrow>
        <AppText weight="bold" size={16}>{title ?? vehicle.name}</AppText>
        {summary ? <AppText size={12} color={colors.muted}>{summary}</AppText> : null}
        <AppText weight="extrabold" size={15} style={{ marginTop: 4 }}>{price(vehicle.prices[11])}</AppText>
      </View>
      <View style={{ alignSelf: 'flex-start' }}>
        <HeartButton active={isWatched(vehicle.id)} onPress={() => toggleWatch(vehicle.id)} label={t('vehicles.watch')} />
      </View>
    </Tap>
  );
}
