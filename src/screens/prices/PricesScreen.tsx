import React from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import { PrimaryButton } from '../../components/Buttons';
import { Card, Page, ScreenTitle } from '../../components/Layout';
import Icon from '../../components/Icon';
import StickyBlock from '../../components/StickyBlock';
import Tap from '../../components/Tap';
import { useApp } from '../../context/AppContext';
import { useNav } from '../../navigation/NavContext';
import { colors } from '../../theme/colors';
import { brandOf, modelOf, trimOf } from '../../utils/brand';
import { changeColor } from '../../utils/color';
import { formatPct, pctChange } from '../../utils/format';
import { monthLabels } from '../../utils/months';
import AlarmRow from './AlarmRow';
import MonthBars from './MonthBars';
import VehiclePicker from './VehiclePicker';

export default function PricesScreen() {
  const { t, lang, vehicles, listMonth, profile, price } = useApp();
  const nav = useNav();
  const watched = (profile?.watch ?? [])
    .map((id) => vehicles.find((v) => v.id === id))
    .filter((v): v is NonNullable<typeof v> => !!v);
  const sel = watched.find((v) => v.id === nav.priceSel) ?? watched[0];

  if (!sel) {
    return (
      <Page>
        <StickyBlock>
          <ScreenTitle>{t('prices.title')}</ScreenTitle>
        </StickyBlock>
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
  const months = monthLabels(lang, listMonth, P.length);
  const m = Math.min(nav.monthSel, P.length - 1); // yeni modellerde yalnızca fiyatlandığı aylar var
  const ch = m > 0 ? pctChange(P[m - 1], P[m]) : null;

  return (
    <Page>
      <StickyBlock>
        <ScreenTitle>{t('prices.title')}</ScreenTitle>
        <VehiclePicker items={watched} selectedId={sel.id} onSelect={nav.setPriceSel} />
      </StickyBlock>

      {/* Seçili aracın marka, model ve paketi; buton, aracın detay sayfasını açar. */}
      <Tap onPress={() => nav.openDetail(sel.id)} accessibilityRole="button" pressedBg={colors.card2}
        style={{ minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: colors.lime, backgroundColor: colors.limeSoft, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingLeft: 16, paddingRight: 12 }}>
        <AppText weight="bold" size={15} numberOfLines={2} style={{ flex: 1 }}>
          {[brandOf(sel), modelOf(sel), trimOf(sel)].filter(Boolean).join(' ')}
        </AppText>
        <Icon name="chevron" size={18} color={colors.lime} />
      </Tap>

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
        {Array.from({ length: Math.min(6, P.length) }, (_, k) => P.length - 1 - k).map((i) => {
          const c = i > 0 ? pctChange(P[i - 1], P[i]) : null;
          return (
            <View key={i} style={{ flexDirection: 'row', paddingVertical: 11, borderTopWidth: 1, borderTopColor: colors.line }}>
              <AppText size={14} style={{ flex: 1 }}>{months.long[i]}</AppText>
              <AppText weight="bold" size={14} style={{ width: 120, textAlign: 'right' }}>{price(P[i])}</AppText>
              <AppText weight="bold" size={14} color={c === null ? colors.muted : changeColor(c)} style={{ width: 72, textAlign: 'right' }}>{c === null ? '—' : formatPct(c, lang)}</AppText>
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
