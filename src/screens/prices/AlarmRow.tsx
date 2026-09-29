import React from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import Icon from '../../components/Icon';
import { Card } from '../../components/Layout';
import ToggleSwitch from '../../components/ToggleSwitch';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';

/** Seçili araç için fiyat alarmı anahtarı. */
export default function AlarmRow({ vehicleId }: { vehicleId: string }) {
  const { t, profile, toggleAlarm } = useApp();
  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16 }}>
      <Icon name="bell" size={22} color={colors.lime} />
      <View style={{ flex: 1 }}>
        <AppText weight="bold" size={14}>{t('prices.alarm')}</AppText>
        <AppText size={12} color={colors.muted}>{t('prices.alarmSub')}</AppText>
      </View>
      <ToggleSwitch value={!!profile?.alarms[vehicleId]} onToggle={() => toggleAlarm(vehicleId)} label={t('prices.alarm')} />
    </Card>
  );
}
