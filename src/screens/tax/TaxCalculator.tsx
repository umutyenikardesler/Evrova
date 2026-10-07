import React, { useState } from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import { Card } from '../../components/Layout';
import TextField from '../../components/TextField';
import { useApp } from '../../context/AppContext';
import { breakdown, mtvFor } from '../../data/taxes';
import { colors } from '../../theme/colors';
import { formatPrice } from '../../utils/format';

const digits = (s: string) => s.replace(/\D/g, '');
const groupTR = (s: string, lang: 'tr' | 'en') => s.replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'tr' ? '.' : ',');

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, paddingVertical: 7, borderTopWidth: 1, borderTopColor: colors.line }}>
      <AppText size={13} color={strong ? colors.ink : colors.muted} weight={strong ? 'bold' : 'medium'} style={{ flex: 1 }}>{label}</AppText>
      <AppText size={strong ? 16 : 14} weight={strong ? 'extrabold' : 'bold'} color={strong ? colors.lime : colors.ink}>{value}</AppText>
    </View>
  );
}

/** Anahtar teslim fiyat + motor gücünden matrah, ÖTV, KDV ve yıllık MTV hesaplar. */
export default function TaxCalculator({ power, onPower }: { power: string; onPower: (v: string) => void }) {
  const { t, lang } = useApp();
  const [price, setPrice] = useState('');
  const total = Number(digits(price));
  const kw = Number(digits(power));
  const ready = total > 0 && kw > 0;
  const b = ready ? breakdown(total, kw) : null;
  const tl = (n: number) => formatPrice(n, lang, false);

  return (
    <Card style={{ borderRadius: 22, padding: 16, gap: 10 }}>
      <View>
        <AppText weight="bold" size={17}>{t('tax.calcTitle')}</AppText>
        <AppText size={12} color={colors.muted}>{t('tax.calcSub')}</AppText>
      </View>
      <TextField height={46} keyboardType="number-pad" placeholder={t('tax.priceField')}
        value={groupTR(digits(price), lang)} onChangeText={(v) => setPrice(digits(v))} />
      <TextField height={46} keyboardType="number-pad" placeholder={t('tax.powerField')}
        value={digits(power)} onChangeText={(v) => onPower(digits(v).slice(0, 4))} />
      {b ? (
        <View>
          <Line label={t('tax.matrah')} value={tl(b.matrah)} />
          <Line label={t('tax.otv', { rate: Math.round(b.rate * 100) })} value={tl(b.otv)} />
          <Line label={t('tax.kdv')} value={tl(b.kdv)} />
          <Line label={t('tax.totalTax', { pct: Math.round((b.tax / total) * 100) })} value={tl(b.tax)} />
          <Line strong label={t('tax.mtvYear')} value={tl(mtvFor(kw))} />
        </View>
      ) : (
        <AppText size={12} color={colors.muted}>{t('tax.calcHint')}</AppText>
      )}
    </Card>
  );
}
