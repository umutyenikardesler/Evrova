import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

/**
 * Dolu (solid) mod bayrakları:
 *  d: detay çizgisi (içi boş, detailColor çizgi)   g: yalnızca iç dairesi detailColor ile dolu, çizgisi ikon renginde (ör. lastik)
 *  o: yalnızca dolu modda çizilen detay çizgisi   w: o çizginin kalınlığı
 *  v: yalnızca dolu modda çizilen, detailColor dolgulu "cam" alanı (ör. arabanın ön camı)
 *  t: yalnızca dolu modda çizilen, açık renk dolgulu ve kalın ikon renginde çizgili alan (ör. gazetenin sol küçük alanı)
 */
type El =
  | { p: string; d?: true; t?: true; o?: true; v?: true; w?: number }
  | { c: [number, number, number]; d?: true; g?: true }
  | { r: [number, number, number, number, number]; d?: true };

// Yollar tasarım dosyasındaki (Lucide) SVG'lerle birebir aynıdır.
const ICONS = {
  zap: [{ p: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z' }],
  trending: [{ p: 'M22 7 13.5 15.5 8.5 10.5 2 17' }, { p: 'M16 7h6v6' }],
  news: [
    { p: 'M15 18h-5', d: true }, { p: 'M18 14h-8', d: true },
    { p: 'M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2' },
    { p: 'M6 9H4a2 2 0 0 0-2 2v9a2 2 0 0 0 4 0V9z', t: true },
    { r: [10, 6, 8, 4, 1], d: true },
  ],
  scale: [
    { p: 'm16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z' },
    { p: 'm2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z' },
    { p: 'M7 21h10' }, { p: 'M12 3v18' }, { p: 'M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2' },
  ],
  bell: [
    { p: 'M10.268 21a2 2 0 0 0 3.464 0' },
    { p: 'M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326' },
  ],
  back: [{ p: 'm12 19-7-7 7-7' }, { p: 'M19 12H5' }],
  heart: [{ p: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' }],
  moto: [
    { c: [18.5, 17.5, 3.5] }, { c: [5.5, 17.5, 3.5] }, { c: [15, 5, 1] }, { p: 'M12 17.5V14l-3-3 4-3 2 3h2' },
  ],
  car: [
    { p: 'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2' },
    { c: [7, 17, 2], g: true }, { p: 'M9 17h6' }, { c: [17, 17, 2], g: true },
    { p: 'M8.5 8.4h3.3c.3 0 .6.15.8.35L14.3 10H8.5z', v: true, w: 0.7 },
  ],
  van: [
    { p: 'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2' }, { p: 'M15 18H9' },
    { p: 'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14' },
    { c: [17, 18, 2] }, { c: [7, 18, 2] },
  ],
  home: [
    { p: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8', d: true },
    { p: 'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  ],
  user: [{ p: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' }, { c: [12, 7, 4] }],
  logout: [{ p: 'm16 17 5-5-5-5' }, { p: 'M21 12H9' }, { p: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }],
  check: [{ p: 'M20 6 9 17l-5-5' }],
  chevron: [{ p: 'm9 18 6-6-6-6' }],
  edit: [
    { p: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z' },
    { p: 'm15 5 4 4' },
  ],
} satisfies Record<string, El[]>;

export type IconName = keyof typeof ICONS;

interface Props {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
  fill?: string;
  /** Dolu (içi boyalı) görünüm: aktif sekme ikonları için. Detay çizgileri detailColor ile çizilir. */
  solid?: boolean;
  detailColor?: string;
}

export default function Icon({ name, size = 22, color, strokeWidth = 2, fill = 'none', solid = false, detailColor = '#FFFFFF' }: Props) {
  // Dolu modda önce gövde, sonra detaylar çizilir ki gövdenin altında kalmasın
  const els = [...(ICONS[name] as El[])].filter((el) => solid || !('t' in el && el.t || 'o' in el && el.o || 'v' in el && el.v)).sort((a, b) => Number(!!a.d) - Number(!!b.d));
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {els.map((el, i) => {
        const detail = solid && !!el.d;
        const wheel = solid && 'g' in el && !!el.g;
        const tab = solid && 't' in el && !!el.t;
        const glass = solid && 'v' in el && !!el.v;
        // lastik: içi beyaz, çizgisi yeşil | sol alan: yumuşak beyaz, kalın yeşil çizgi | detay: beyaz çizgi
        const body = solid && !el.d ? (wheel || tab || glass ? detailColor : color) : 'none';
        const stroke = detail || glass ? detailColor : color;
        const sw = tab ? strokeWidth * 1.25 : 'w' in el && el.w ? el.w : strokeWidth;
        const fo = tab ? 1.5 : 1;
        if ('p' in el) return <Path key={i} d={el.p} fill={solid ? body : fill} fillOpacity={fo} stroke={stroke} strokeWidth={sw} />;
        if ('c' in el) return <Circle key={i} cx={el.c[0]} cy={el.c[1]} r={el.c[2]} fill={body} stroke={stroke} />;
        return <Rect key={i} x={el.r[0]} y={el.r[1]} width={el.r[2]} height={el.r[3]} rx={el.r[4]} fill={body} stroke={stroke} />;
      })}
    </Svg>
  );
}
