import React from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import { BackButton, HeartButton, PrimaryButton } from '../../components/Buttons';
import { Pill } from '../../components/Chips';
import { Card, Page } from '../../components/Layout';
import PriceLineChart from '../../components/PriceLineChart';
import { useApp } from '../../context/AppContext';
import { useNav } from '../../navigation/NavContext';
import { colors } from '../../theme/colors';
import { changeColor } from '../../utils/color';
import { formatPct, pctChange } from '../../utils/format';
import { vehicleGallery } from '../../utils/vehicleImage';
import DetailPhoto from './DetailPhoto';

export default function VehicleDetailScreen({ id }: { id: string }) {
  const { t, lang, vehicles, price, isWatched, toggleWatch } = useApp();
  const nav = useNav();
  const v = vehicles.find((x) => x.id === id);
  if (!v) return null;

  const watched = isWatched(v.id);
  const yoy = pctChange(v.prices[0], v.prices[11]);

  return (
    <Page top={6}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <BackButton onPress={nav.closeDetail} label={t('common.back')} />
        <HeartButton square size={44} active={watched} onPress={() => toggleWatch(v.id)} label={t('vehicles.watch')} />
      </View>

      <DetailPhoto images={vehicleGallery(v)} />

      <View>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
          <Pill label={t(`types.${v.type}`)} />
          <Pill label={v.tagline[lang]} tone="card" />
        </View>
        <AppText weight="extrabold" size={28} style={{ letterSpacing: -0.56 }}>{v.name}</AppText>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 }}>
        {v.specs.map((s, i) => (
          <View key={i} style={{ width: '48.5%', backgroundColor: colors.card, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16 }}>
            <AppText size={12} color={colors.muted}>{s.label[lang]}</AppText>
            <AppText weight="extrabold" size={19} style={{ marginTop: 2 }}>{s.value[lang]}</AppText>
          </View>
        ))}
      </View>

      <Card style={{ borderRadius: 22, padding: 18, gap: 4 }}>
        <AppText weight="semibold" size={12} color={colors.muted}>{t('detail.listPrice')}</AppText>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <AppText weight="extrabold" size={26}>{price(v.prices[11])}</AppText>
          <AppText weight="bold" size={13} color={changeColor(yoy)}>{t('detail.per12', { pct: formatPct(yoy, lang) })}</AppText>
        </View>
        <PriceLineChart prices={v.prices} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText size={11} color={colors.muted}>{t('detail.oct')}</AppText>
          <AppText size={11} color={colors.muted}>{t('detail.sep')}</AppText>
        </View>
      </Card>

      <PrimaryButton
        height={52}
        label={watched ? t('detail.history') : t('detail.track')}
        onPress={() => {
          if (!watched) toggleWatch(v.id);
          nav.openPrices(v.id);
        }}
      />
    </Page>
  );
}
