import React from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

interface Props extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Basılıyken uygulanacak arka plan rengi */
  pressedBg?: string;
}

/** Basılı durumda arka planı değişen Pressable (tasarımdaki hover/active karşılığı). */
export default function Tap({ style, pressedBg, ...rest }: Props) {
  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [style, pressed && pressedBg ? { backgroundColor: pressedBg } : null, pressed && !pressedBg ? { opacity: 0.85 } : null]}
    />
  );
}
