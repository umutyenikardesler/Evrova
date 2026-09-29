import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';

function Stat({ label, value, unit, accent }: { label: string; value: string; unit?: string; accent?: boolean }) {
  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(32,44,61,0.72)', borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 10 }}>
      <AppText weight="bold" size={10} color={colors.muted} style={{ letterSpacing: 0.8 }}>{label}</AppText>
      <AppText weight="extrabold" size={16} color={accent ? colors.lime : colors.ink}>
        {value}{unit ? <AppText size={11} color={colors.muted}> {unit}</AppText> : null}
      </AppText>
    </View>
  );
}

/** Giriş ekranındaki hız / batarya / menzil simülasyon kartları. */
export default function SimStats() {
  const { t } = useApp();
  const [speed, setSpeed] = useState(84);
  const [bat, setBat] = useState(82);

  useEffect(() => {
    const id = setInterval(() => {
      setSpeed((s) => Math.max(58, Math.min(112, s + Math.round(Math.random() * 12 - 6))));
      setBat((b) => (b <= 41 ? 82 : b - (Math.random() < 0.35 ? 1 : 0)));
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 22, paddingTop: 16 }}>
      <Stat label={t('auth.speed')} value={String(speed)} unit={t('auth.kmh')} />
      <Stat label={t('auth.battery')} value={`%${bat}`} accent />
      <Stat label={t('auth.range')} value={String(Math.round(bat * 4.9))} unit="km" />
    </View>
  );
}
