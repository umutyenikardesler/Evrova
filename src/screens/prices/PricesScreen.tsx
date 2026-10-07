import React from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import { PrimaryButton } from '../../components/Buttons';
import { ChipScroller } from '../../components/Chips';
import { Card, Page, ScreenTitle } from '../../components/Layout';
import { useApp } from '../../context/AppContext';
import { useNav } from '../../navigation/NavContext';
import { colors } from '../../theme/colors';
import { changeColor } from '../../utils/color';
import { formatPct, pctChange } from '../../utils/format';
import { monthLabels } from '../../utils/months';
import AlarmRow from './AlarmRow';
import MonthBars from './MonthBars';

export default function PricesScreen() {
  const { t, lang, vehicles, listMonth, profile, price } = useApp();
  const months = monthLabels(lang, listMonth);
  const nav = useNav();
  const watched = (profile?.watch ?? [])
    .map((id) => vehicles.find((v) => v.id === id))
    .filter((v): v is NonNullable<typeof v> => !!v);
  const sel = watched.find((v) => v.id === nav.priceSel) ?? watched[0];

  if (!sel) {
    return (
      <Page>
        <ScreenTitle>{t('prices.title')}</ScreenTitle>
        <Card style={{ borderRadius: 22, padding: 18, gap: 10 }}>
          <AppText weight="bold" size={17}>{t('prices.emptyTitle')}</AppText>
          <AppText size={13} color={colors.muted}>{t('prices.emptyText')}</AppText>
          <View style={{ alignSelf: 'flex-start' }}>
            <PrimaryButton label={t('prices.browse')} height={44} fontSize={14} onPress={() => nav.go('vehicles')} style={{ paddingHorizontal: 18, borderRadius: 12 }} />
          </View>
        </Card>
      </Page>
    );
  }

  const P = sel.prices;
  const m = nav.monthSel;
  const ch = m > 0 ? pctChange(P[m - 1], P[m]) : null;

  return (
    <Page>
      <ScreenTitle>{t('prices.title')}</ScreenTitle>
      <ChipScroller
        items={watched.map((v) => ({ key: v.id, label: v.name, active: v.id === sel.id, onPress: () => nav.setPriceSel(v.id) }))}
      />

      <Card style={{ borderRadius: 22, padding: 18, gap: 14 }}>
        <View>
          <AppText weight="semibold" size={13} color={colors.muted}>{months.long[m]}</AppText>
          <AppText weight="extrabold" size={30} style={{ letterSpacing: -0.6, lineHeight: 36 }}>{price(P[m])}</AppText>
          <AppText weight="bold" size={13} color={ch === null ? colors.muted : changeColor(ch)}>
            {ch === null ? t('prices.start') : t('prices.vsPrev', { pct: formatPct(ch, lang) })}
          </AppText>
        </View>
        <MonthBars prices={P} selected={m} onSelect={nav.setMonthSel} />
      </Card>

      <AlarmRow vehicleId={sel.id} />

      <Card style={{ paddingVertical: 6, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', paddingTop: 12, paddingBottom: 8 }}>
          <Head style={{ flex: 1 }}>{t('prices.colMonth')}</Head>
          <Head style={{ width: 120, textAlign: 'right' }}>{t('prices.colPrice')}</Head>
          <Head style={{ width: 72, textAlign: 'right' }}>{t('prices.colChange')}</Head>
        </View>
        {[11, 10, 9, 8, 7, 6].map((i) => {
          const c = pctChange(P[i - 1], P[i]);
          return (
            <View key={i} style={{ flexDirection: 'row', paddingVertical: 11, borderTopWidth: 1, borderTopColor: colors.line }}>
              <AppText size={14} style={{ flex: 1 }}>{months.long[i]}</AppText>
              <AppText weight="bold" size={14} style={{ width: 120, textAlign: 'right' }}>{price(P[i])}</AppText>
              <AppText weight="bold" size={14} color={changeColor(c)} style={{ width: 72, textAlign: 'right' }}>{formatPct(c, lang)}</AppText>
            </View>
          );
        })}
      </Card>
    </Page>
  );
}

function Head({ children, style }: { children: string; style: object }) {
  return (
    <AppText weight="bold" size={11} color={colors.muted} style={[{ letterSpacing: 0.88, textTransform: 'uppercase' }, style]}>
      {children}
    </AppText>
  );
}
