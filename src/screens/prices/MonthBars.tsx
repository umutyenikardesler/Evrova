import React from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import Tap from '../../components/Tap';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { monthLabels } from '../../utils/months';

/** 12 aylık dokunulabilir sütun grafiği. */
export default function MonthBars({ prices, selected, onSelect }: { prices: number[]; selected: number; onSelect: (i: number) => void }) {
  const { lang, listMonth } = useApp();
  const months = monthLabels(lang, listMonth).short;
  const min = Math.min(...prices) * 0.96;
  const max = Math.max(...prices);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 130 }}>
      {prices.map((p, i) => {
        const on = i === selected;
        const pct = 18 + ((p - min) / (max - min)) * 82;
        return (
          <Tap key={i} onPress={() => onSelect(i)} accessibilityLabel={months[i]}
            style={{ flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
            <View style={{ width: '100%', height: `${Math.round(pct) * 0.86}%`, backgroundColor: on ? colors.lime : colors.bar, borderRadius: 6 }} />
            <AppText weight="bold" size={9.5} color={on ? colors.lime : colors.muted}>{months[i]}</AppText>
          </Tap>
        );
      })}
    </View>
  );
}
