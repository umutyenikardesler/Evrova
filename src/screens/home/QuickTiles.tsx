import React from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import Icon, { type IconName } from '../../components/Icon';
import Tap from '../../components/Tap';
import { useApp } from '../../context/AppContext';
import { useNav } from '../../navigation/NavContext';
import { colors } from '../../theme/colors';

function Tile({ icon, title, sub, onPress }: { icon: IconName; title: string; sub: string; onPress: () => void }) {
  return (
    <Tap onPress={onPress} pressedBg={colors.card2}
      style={{ width: '48.5%', backgroundColor: colors.card, borderRadius: 20, padding: 16, gap: 14 }}>
      <Icon name={icon} size={22} color={colors.lime} strokeWidth={2.2} />
      <View>
        <AppText weight="bold" size={16}>{title}</AppText>
        <AppText size={12} color={colors.muted} style={{ marginTop: 4 }}>{sub}</AppText>
      </View>
    </Tap>
  );
}

/** Ana sayfadaki 2x2 kısayol kartları. */
export default function QuickTiles() {
  const { t, showToast } = useApp();
  const nav = useNav();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
      <Tile icon="trending" title={t('home.priceTracking')} sub={t('home.priceTrackingSub')} onPress={() => nav.go('prices')} />
      <Tile icon="zap" title={t('home.charging')} sub={t('home.chargingSub')} onPress={() => showToast(t('home.chargingSoon'))} />
      <Tile icon="news" title={t('home.news')} sub={t('home.newsSub')} onPress={() => nav.go('news')} />
      <Tile icon="scale" title={t('home.tax')} sub={t('home.taxSub')} onPress={() => showToast(t('home.taxSoon'))} />
    </View>
  );
}
