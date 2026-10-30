import React, { useState } from 'react';
import { Animated } from 'react-native';
import { useScrollY } from '../navigation/ScrollContext';
import { colors } from '../theme/colors';

/**
 * Sayfa içinde kaydırırken ekranın üstüne yapışan bölüm (Page'in doğrudan çocuğu olmalı).
 * Arka planı sayfa rengidir; altından akan içerik görünmez. Akıştaki yerini/boşluklarını değiştirmez.
 */
export default function StickyBlock({ children, gap = 16 }: { children: React.ReactNode; gap?: number }) {
  const scrollY = useScrollY();
  const [y, setY] = useState(0);
  // Sayfanın en üstündeki blokta layout.y negatif olabilir (negatif marginTop). Aralık kesinlikle artan olmalı:
  // eşit iki nokta native interpolasyonda scrollY = 0 iken sıfıra bölme yapıp bloğu ekran dışına atar.
  const top = Math.max(y, 0.01);
  const shift = scrollY?.interpolate({ inputRange: [0, top, top + 1], outputRange: [0, 0, 1], extrapolateLeft: 'clamp' });
  return (
    <Animated.View
      onLayout={(e) => setY(e.nativeEvent.layout.y)}
      style={{
        zIndex: 10, elevation: 10, gap, backgroundColor: colors.bg,
        marginHorizontal: -18, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 8, marginTop: -8, marginBottom: -8,
        transform: shift ? [{ translateY: shift }] : undefined,
      }}>
      {children}
    </Animated.View>
  );
}
