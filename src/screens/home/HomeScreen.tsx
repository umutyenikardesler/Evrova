import React from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import { LinkButton, PrimaryButton } from '../../components/Buttons';
import { Card, Page } from '../../components/Layout';
import Tap from '../../components/Tap';
import { useApp } from '../../context/AppContext';
import { useNav } from '../../navigation/NavContext';
import { colors } from '../../theme/colors';
import { changeColor } from '../../utils/color';
import { formatPct, pctChange } from '../../utils/format';
import { monthTitle } from '../../utils/months';
import { nameParts } from '../../utils/name';
import HomeHeader from './HomeHeader';
import QuickTiles from './QuickTiles';

export default function HomeScreen() {
  const { t, lang, vehicles, listMonth, profile, price, notifications } = useApp();
  const nav = useNav();
  const watched = (profile?.watch ?? [])
    .map((id) => vehicles.find((v) => v.id === id))
    .filter((v): v is NonNullable<typeof v> => !!v);
  const hasUnread = notifications.some((n) => !profile?.readNotifs.includes(n.id));

  return (
    <Page>
      <HomeHeader name={nameParts(profile).full} hasUnread={hasUnread} />

      <Card style={{ borderRadius: 22, padding: 18, gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <AppText weight="semibold" size={13} color={colors.muted}>{t('home.prices')}</AppText>
          <View style={{ backgroundColor: 'rgba(110,224,154,0.12)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 }}>
            <AppText weight="semibold" size={12} color={colors.down}>{monthTitle(lang, listMonth)}</AppText>
          </View>
        </View>
        <AppText weight="extrabold" size={30} style={{ letterSpacing: -0.6, marginTop: 4 }}>{t('home.discover')}</AppText>
        <AppText size={14} color={colors.muted}>{t('home.discoverSub')}</AppText>
        <PrimaryButton label={t('home.browse')} onPress={() => nav.go('vehicles')} style={{ marginTop: 12 }} />
      </Card>

      <QuickTiles />

      <View style={{ gap: 10, marginTop: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText weight="bold" size={17}>{t('home.watching')}</AppText>
          <LinkButton label={t('home.seeAll')} onPress={() => nav.go('prices')} />
        </View>
        {watched.length > 0 ? (
          <Card style={{ paddingVertical: 4, paddingHorizontal: 16 }}>
            {watched.map((v, i) => {
              const ch = pctChange(v.prices[10], v.prices[11]);
              return (
                <Tap key={v.id} onPress={() => nav.openPrices(v.id)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: i < watched.length - 1 ? 1 : 0, borderBottomColor: colors.line }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <AppText weight="bold" size={15}>{v.name}</AppText>
                    <AppText size={12} color={colors.muted}>{t(`types.${v.type}`)}</AppText>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <AppText weight="bold" size={15}>{price(v.prices[11])}</AppText>
                    <AppText weight="bold" size={12} color={changeColor(ch)}>{t('home.thisMonth', { pct: formatPct(ch, lang) })}</AppText>
                  </View>
                </Tap>
              );
            })}
          </Card>
        ) : (
          <Card style={{ padding: 16 }}>
            <AppText size={13} color={colors.muted}>{t('home.emptyWatch')}</AppText>
          </Card>
        )}
      </View>
    </Page>
  );
}
