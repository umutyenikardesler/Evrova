import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/colors';

const W = 310, H = 90, PAD = 6;

/** 12 aylık fiyat serisi için alan + çizgi grafiği. */
export default function PriceLineChart({ prices }: { prices: number[] }) {
  const min = Math.min(...prices), max = Math.max(...prices);
  const pts = prices.map((p, i) => [PAD + (i * (W - 2 * PAD)) / (prices.length - 1), H - PAD - ((p - min) / (max - min || 1)) * (H - 2 * PAD)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${W - PAD} ${H} L${PAD} ${H} Z`;
  return (
    <Svg width="100%" viewBox={`0 0 ${W} ${H}`} height={90} preserveAspectRatio="none" style={{ marginTop: 8 }}>
      <Path d={area} fill={colors.chartFill} />
      <Path d={line} fill="none" stroke={colors.lime} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
