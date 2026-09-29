import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, Ellipse, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

const LIME = 'rgba(185,242,39,';
const CELL = 44;

/** Sonsuz döngülü Animated.Value (0 → to). */
function useLoop(to: number, duration: number, delay = 0, easing = Easing.linear) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(v, { toValue: to, duration, easing, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, [v, to, duration, delay, easing]);
  return v;
}

function Car() {
  const wheel = (x: number, y: number) => <Rect x={x} y={y} width={5} height={16} rx={2} fill="#0b111c" />;
  return (
    <Svg width={44} height={80} viewBox="0 0 60 110" fill="none" stroke="#B9F227" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      {wheel(1, 22)}{wheel(54, 22)}{wheel(1, 78)}{wheel(54, 78)}
      <Path d="M30 2C44 2 52 8 53 20l2 24v48c0 10-7 16-25 16S5 102 5 92V44l2-24C8 8 16 2 30 2z" fill="rgba(16,24,39,.95)" />
      <Path d="M12 34c6-5 30-5 36 0l-3 16c-7-3-23-3-30 0z" fill={`${LIME}.16)`} />
      <Rect x={15} y={53} width={30} height={28} rx={6} fill={`${LIME}.07)`} />
      <Path d="M15 85c7 2 23 2 30 0l2 11c-9 3-25 3-34 0z" fill={`${LIME}.12)`} />
      <Ellipse cx={3} cy={38} rx={2.5} ry={1.8} />
      <Ellipse cx={57} cy={38} rx={2.5} ry={1.8} />
      <Path d="M10 13l10-5M50 13l-10-5" strokeWidth={3} />
      <Path d="M11 104h38" stroke="#ff5a5a" strokeWidth={2.6} />
    </Svg>
  );
}

function Streak({ i, areaH, x }: { i: number; areaH: number; x: number }) {
  const dur = (0.9 + (i % 3) * 0.35) * 1000;
  const y = useLoop(420, dur, i * 270);
  const h = 60 + (i % 3) * 30;
  return (
    <Animated.View style={{ position: 'absolute', top: areaH * 0.44 - 160, left: x, width: 2, height: h, transform: [{ translateY: y }] }}>
      <LinearGradient colors={[`${LIME}0)`, `${LIME}.8)`]} style={{ flex: 1, borderRadius: 2 }} />
    </Animated.View>
  );
}

/** Perspektifli neon yol animasyonu (giriş ekranı arka planı). */
export default function LoginBackground() {
  const { width, height } = useWindowDimensions();
  const areaH = height * 0.64;
  const horizon = areaH * 0.44;
  const gridH = areaH * 0.86;
  const gridW = width * 2.4;

  const scroll = useLoop(CELL, 800);
  const bob = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.55)).current;
  useEffect(() => {
    const b = Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: -3, duration: 550, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(bob, { toValue: 0, duration: 550, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    const p = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.55, duration: 1500, useNativeDriver: true }),
    ]));
    b.start(); p.start();
    return () => { b.stop(); p.stop(); };
  }, [bob, pulse]);

  const hLines = useMemo(() => Array.from({ length: Math.ceil(gridH / CELL) + 2 }, (_, i) => i), [gridH]);
  const vLines = useMemo(() => Array.from({ length: Math.ceil(gridW / CELL) + 1 }, (_, i) => i), [gridW]);
  const streakX = [6, 14, 24, 74, 84, 93].map((p) => (width * p) / 100);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: areaH, overflow: 'hidden' }}>
        {/* Izgara + yol */}
        <View
          style={{
            position: 'absolute', left: -width * 0.7, width: gridW, top: horizon, height: gridH, overflow: 'hidden',
            transformOrigin: 'top center',
            transform: [{ perspective: 240 }, { rotateX: '62deg' }],
          }}>
          {vLines.map((i) => (
            <View key={`v${i}`} style={{ position: 'absolute', top: 0, bottom: 0, left: i * CELL, width: 1, backgroundColor: `${LIME}.2)` }} />
          ))}
          <Animated.View style={{ position: 'absolute', left: 0, right: 0, top: -CELL, height: gridH + CELL * 2, transform: [{ translateY: scroll }] }}>
            {hLines.map((i) => (
              <View key={`h${i}`} style={{ position: 'absolute', left: 0, right: 0, top: i * CELL, height: 1, backgroundColor: `${LIME}.2)` }} />
            ))}
          </Animated.View>
          <View style={{ position: 'absolute', left: gridW / 2 - 65, width: 130, top: 0, bottom: 0, backgroundColor: 'rgba(16,24,39,.8)', borderLeftWidth: 2, borderRightWidth: 2, borderColor: `${LIME}.8)`, overflow: 'hidden' }}>
            <Animated.View style={{ position: 'absolute', left: 63, width: 4, top: -CELL, height: gridH + CELL * 2, transform: [{ translateY: scroll }] }}>
              {hLines.map((i) => (
                <View key={i} style={{ position: 'absolute', top: i * CELL, height: CELL / 2, width: 4, backgroundColor: '#B9F227' }} />
              ))}
            </Animated.View>
          </View>
        </View>

        {/* Ufuk çizgisi + parlama */}
        <View style={{ position: 'absolute', left: 0, right: 0, top: horizon, height: 1, backgroundColor: `${LIME}.5)` }} />
        <Animated.View style={{ position: 'absolute', left: width / 2 - 230, top: horizon - 120, width: 460, height: 240, opacity: pulse }}>
          <Svg width={460} height={240}>
            <Defs>
              <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#B9F227" stopOpacity={0.22} />
                <Stop offset="1" stopColor="#B9F227" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Ellipse cx={230} cy={120} rx={230} ry={120} fill="url(#glow)" />
          </Svg>
        </Animated.View>

        {streakX.map((x, i) => <Streak key={i} i={i} areaH={areaH} x={x} />)}

        {/* Araba */}
        <Animated.View style={{ position: 'absolute', left: width / 2 - 22, top: areaH * 0.47, alignItems: 'center', transform: [{ translateY: bob }] }}>
          <Car />
          <View style={{ width: 50, height: 12, marginTop: -8, borderRadius: 25, backgroundColor: `${LIME}.25)` }} />
        </Animated.View>
      </View>
    </View>
  );
}
