import React from 'react';
import { Text, type TextProps } from 'react-native';
import { colors, fonts } from '../theme/colors';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

interface Props extends TextProps {
  weight?: Weight;
  size?: number;
  color?: string;
}

/** Tüm metinlerde Manrope kullanan sarmalayıcı. */
export default function AppText({ weight = 'regular', size = 14, color = colors.ink, style, ...rest }: Props) {
  return <Text {...rest} style={[{ fontFamily: fonts[weight], fontSize: size, color }, style]} />;
}
