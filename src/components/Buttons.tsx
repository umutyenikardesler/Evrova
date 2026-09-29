import React from 'react';
import { colors } from '../theme/colors';
import AppText from './AppText';
import Icon from './Icon';
import Tap from './Tap';

/** Lime dolgulu ana buton. */
export function PrimaryButton({ label, onPress, height = 50, fontSize = 16, style }: {
  label: string; onPress: () => void; height?: number; fontSize?: number; style?: object;
}) {
  return (
    <Tap onPress={onPress} pressedBg="#a5d91f" style={[{ height, borderRadius: 14, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }, style]}>
      <AppText weight="bold" size={fontSize} color={colors.bg}>{label}</AppText>
    </Tap>
  );
}

/** Geri oku butonu (kare, kart renginde). */
export function BackButton({ onPress, size = 44, label }: { onPress: () => void; size?: number; label: string }) {
  return (
    <Tap onPress={onPress} accessibilityLabel={label} pressedBg={colors.card2}
      style={{ width: size, height: size, borderRadius: size > 40 ? 14 : 12, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="back" size={size > 40 ? 20 : 18} color={colors.ink} strokeWidth={2.2} />
    </Tap>
  );
}

/** Yazı şeklinde lime bağlantı butonu. */
export function LinkButton({ label, onPress, size = 13, weight = 'semibold' }: {
  label: string; onPress: () => void; size?: number; weight?: 'semibold' | 'bold';
}) {
  return (
    <Tap onPress={onPress} hitSlop={8}>
      <AppText weight={weight} size={size} color={colors.lime}>{label}</AppText>
    </Tap>
  );
}

/** Kalp (takip) butonu. */
export function HeartButton({ active, onPress, size = 40, square = false, label }: {
  active: boolean; onPress: () => void; size?: number; square?: boolean; label: string;
}) {
  return (
    <Tap onPress={onPress} accessibilityLabel={label} pressedBg={square ? colors.card2 : colors.limeSoft}
      style={{ width: size, height: size, borderRadius: square ? 14 : size / 2, backgroundColor: square ? colors.card : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="heart" size={20} color={colors.lime} fill={active ? colors.lime : 'none'} />
    </Tap>
  );
}
