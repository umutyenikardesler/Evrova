import React from 'react';
import { View } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import AppText from './AppText';

export default function Toast({ bottom = 104 }: { bottom?: number }) {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <View pointerEvents="none"
      style={{ position: 'absolute', zIndex: 20, left: 18, right: 18, bottom, backgroundColor: colors.ink, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 16, elevation: 10, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 15, shadowOffset: { width: 0, height: 10 } }}>
      <AppText weight="bold" size={14} color={colors.bg}>{toast}</AppText>
    </View>
  );
}
