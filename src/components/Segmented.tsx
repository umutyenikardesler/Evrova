import React from 'react';
import { View } from 'react-native';
import { colors } from '../theme/colors';
import AppText from './AppText';
import Tap from './Tap';

interface Props<T extends string> {
  title: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  first?: boolean;
  note?: string;
}

/** Başlıklı, seçenekleri yan yana gösteren ayar satırı (dil, tema vb.). */
export default function Segmented<T extends string>({ title, options, value, onChange, first, note }: Props<T>) {
  return (
    <View style={{ paddingVertical: 10, gap: 8, borderTopWidth: first ? 0 : 1, borderTopColor: colors.line }}>
      <AppText weight="bold" size={14}>{title}</AppText>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {options.map((o) => {
          const on = value === o.value;
          return (
            <Tap key={o.value} onPress={() => onChange(o.value)} accessibilityState={{ selected: on }}
              style={{ flex: 1, paddingVertical: 8, borderRadius: 12, alignItems: 'center', backgroundColor: on ? colors.lime : colors.card2 }}>
              <AppText weight="bold" size={13} color={on ? colors.bg : colors.ink}>{o.label}</AppText>
            </Tap>
          );
        })}
      </View>
      {note ? <AppText size={12} color={colors.muted}>{note}</AppText> : null}
    </View>
  );
}
