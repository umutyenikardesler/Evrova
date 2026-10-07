import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/colors';

const W = 310, H = 90, PAD = 6;

type Props = {
  prices: number[];
  /** Seçili ay (0..n-1); null ise seçim yok. */
  selected?: number | null;
  /** Grafiğe dokunulduğunda / sürüklendiğinde en yakın ay seçilir; bırakınca seçim kalır. */
  onSelect?: (i: number) => void;
};

/** 12 aylık fiyat serisi için alan + çizgi grafiği; dokununca/sürükleyince ay seçilir. */
export default function PriceLineChart({ prices, selected = null, onSelect }: Props) {
  const [width, setWidth] = useState(0);
  const min = Math.min(...prices), max = Math.max(...prices);
  const n = prices.length;
  const xOf = (i: number) => PAD + (i * (W - 2 * PAD)) / (n - 1);
  const yOf = (p: number) => H - PAD - ((p - min) / (max - min || 1)) * (H - 2 * PAD);
  const pts = prices.map((p, i) => [xOf(i), yOf(p)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${W - PAD} ${H} L${PAD} ${H} Z`;

  const pick = (x: number) => {
    if (!onSelect || !width) return;
    const i = Math.round(((x / width) * W - PAD) / ((W - 2 * PAD) / (n - 1)));
    onSelect(Math.max(0, Math.min(n - 1, i)));
  };

  const sel = selected !== null && selected >= 0 && selected < n ? selected : null;
  const px = sel === null || !width ? 0 : (xOf(sel) / W) * width;
  const py = sel === null ? 0 : yOf(prices[sel]);

  return (
    <View
      style={{ marginTop: 8, height: H }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => !!onSelect}
      onMoveShouldSetResponder={() => !!onSelect}
      onResponderTerminationRequest={() => false}
      onResponderGrant={(e) => pick(e.nativeEvent.locationX)}
      onResponderMove={(e) => pick(e.nativeEvent.locationX)}
    >
      <Svg width="100%" viewBox={`0 0 ${W} ${H}`} height={H} preserveAspectRatio="none" pointerEvents="none">
        <Path d={area} fill={colors.chartFill} />
        <Path d={line} fill="none" stroke={colors.lime} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      {sel !== null && width > 0 && (
        <>
          <View pointerEvents="none" style={{ position: 'absolute', left: px - 0.5, top: 0, bottom: 0, width: 1, backgroundColor: colors.muted, opacity: 0.5 }} />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute', left: px - 6, top: py - 6, width: 12, height: 12, borderRadius: 6,
              backgroundColor: colors.lime, borderWidth: 2.5, borderColor: colors.card,
            }}
          />
        </>
      )}
    </View>
  );
}
