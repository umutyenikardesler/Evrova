import React from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import { Card } from '../../components/Layout';
import { useApp } from '../../context/AppContext';
import { KW_LIMIT, MATRAH_LIMIT, MTV, OTV } from '../../data/taxes';
import { colors } from '../../theme/colors';
import { formatPrice } from '../../utils/format';

function Head({ children, flex = 1, right }: { children: string; flex?: number; right?: boolean }) {
  return (
    <AppText weight="bold" size={10.5} color={colors.muted} style={{ flex, textAlign: right ? 'right' : 'left', letterSpacing: 0.6, textTransform: 'uppercase' }}>{children}</AppText>
  );
}

function Cell({ children, flex = 1, right, bold, lime }: { children: string; flex?: number; right?: boolean; bold?: boolean; lime?: boolean }) {
  return (
    <AppText weight={bold ? 'bold' : 'medium'} size={13} color={lime ? colors.lime : colors.ink} style={{ flex, textAlign: right ? 'right' : 'left' }}>{children}</AppText>
  );
}

const row = { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderTopWidth: 1, borderTopColor: colors.line } as const;

/** ÖTV oranları tablosu. */
export function OtvTable() {
  const { t, lang } = useApp();
  const limit = formatPrice(MATRAH_LIMIT, lang, true);
  const rows: [string, readonly [number, number]][] = [
    [t('tax.upTo', { kw: KW_LIMIT }), OTV.low],
    [t('tax.above', { kw: KW_LIMIT }), OTV.high],
  ];
  return (
    <Card style={{ borderRadius: 22, padding: 16, gap: 4 }}>
      <AppText weight="bold" size={17}>{t('tax.otvTitle')}</AppText>
      <AppText size={12} color={colors.muted} style={{ marginBottom: 8 }}>{t('tax.otvSub')}</AppText>
      <View style={{ flexDirection: 'row', paddingBottom: 6 }}>
        <Head flex={1.3}>{t('tax.colPower')}</Head>
        <Head right>{`≤ ${limit}`}</Head>
        <Head right>{`> ${limit}`}</Head>
      </View>
      {rows.map(([label, [a, b]]) => (
        <View key={label} style={row}>
          <Cell flex={1.3} bold>{label}</Cell>
          <Cell right lime bold>{`%${Math.round(a * 100)}`}</Cell>
          <Cell right lime bold>{`%${Math.round(b * 100)}`}</Cell>
        </View>
      ))}
    </Card>
  );
}

/** MTV tablosu (motor gücü × araç yaşı). */
export function MtvTable({ kw }: { kw: number }) {
  const { t, lang } = useApp();
  const fmt = (n: number | null) => (n === null ? '—' : formatPrice(n, lang, false).replace(/\s?₺$/, ''));
  return (
    <Card style={{ borderRadius: 22, padding: 16, gap: 4 }}>
      <AppText weight="bold" size={17}>{t('tax.mtvTitle')}</AppText>
      <AppText size={12} color={colors.muted} style={{ marginBottom: 8 }}>{t('tax.mtvSub')}</AppText>
      <View style={{ flexDirection: 'row', paddingBottom: 6 }}>
        <Head flex={1.25}>{t('tax.colPower')}</Head>
        <Head right>{t('tax.age13')}</Head>
        <Head right>{t('tax.age46')}</Head>
        <Head right>{t('tax.age711')}</Head>
      </View>
      {MTV.map(([max, a, b, c], i) => {
        const min = i === 0 ? 0 : MTV[i - 1][0] + 1;
        const label = max === Infinity ? t('tax.kwOver', { min }) : i === 0 ? t('tax.kwUnder', { max }) : `${min}–${max} kW`;
        const on = kw > 0 && kw >= min && kw <= max;
        return (
          <View key={i} style={row}>
            <Cell flex={1.25} bold lime={on}>{label}</Cell>
            <Cell right bold={on} lime={on}>{fmt(a)}</Cell>
            <Cell right>{fmt(b)}</Cell>
            <Cell right>{fmt(c)}</Cell>
          </View>
        );
      })}
    </Card>
  );
}
