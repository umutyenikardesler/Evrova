import React from 'react';
import { Linking, Platform, View } from 'react-native';
import AppText from '../../components/AppText';
import Icon from '../../components/Icon';
import Tap from '../../components/Tap';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import type { Charger } from '../../types';

const SOCKET_LABEL: Record<keyof Charger['sockets'], string> = { ccs: 'CCS', chademo: 'CHAdeMO', type2: 'Type 2', type1: 'Type 1', tesla: 'Tesla' };

const openMaps = (c: Charger) => {
  const url = Platform.OS === 'ios'
    ? `http://maps.apple.com/?ll=${c.lat},${c.lon}&q=${encodeURIComponent(c.name)}`
    : `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lon}`;
  Linking.openURL(url).catch(() => {});
};

function Badge({ label, tone }: { label: string; tone: 'lime' | 'card' }) {
  return (
    <View style={{ backgroundColor: tone === 'lime' ? colors.limeSoft : colors.card2, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 }}>
      <AppText weight="semibold" size={11} color={tone === 'lime' ? colors.lime : colors.muted}>{label}</AppText>
    </View>
  );
}

/** Tek istasyon: ad, işletmeci, soketler, mesafe; dokununca harita uygulamasında yol tarifi açar. */
export default function ChargerCard({ charger: c, distanceM }: { charger: Charger; distanceM?: number }) {
  const { t } = useApp();
  const sockets = (Object.keys(SOCKET_LABEL) as (keyof Charger['sockets'])[]).filter((k) => c.sockets[k]);
  const dist = distanceM === undefined ? null
    : distanceM < 1000 ? t('charging.m', { d: Math.round(distanceM / 10) * 10 })
    : t('charging.km', { d: (distanceM / 1000).toFixed(distanceM < 10000 ? 1 : 0) });
  // Başlık işletmeci (yoksa istasyon adı); açıklama istasyon adı, il/ilçe ve ek bilgiler.
  const title = c.operator || c.name;
  // "Bartın Merkez" gibi ilçe adı ili zaten içeriyorsa il tekrar yazılmaz.
  const place = c.district && c.city && !c.district.includes(c.city) ? `${c.district}, ${c.city}` : c.district || c.city || '';
  const facts = [
    place,
    c.kw ? t('charging.kw', { kw: c.kw }) : '',
    c.fee === true ? t('charging.fee') : c.fee === false ? t('charging.free') : '',
    c.hours === '24/7' ? t('charging.open247') : '',
  ].filter(Boolean).join(' · ');

  return (
    <Tap onPress={() => openMaps(c)} accessibilityRole="button" accessibilityLabel={`${c.name}, ${t('charging.directions')}`} pressedBg={colors.card2}
      style={{ backgroundColor: colors.card, borderRadius: 20, padding: 16, gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <AppText weight="bold" size={16} numberOfLines={1} style={{ flex: 1 }}>{title}</AppText>
        {dist && <AppText weight="bold" size={14} color={colors.lime}>{dist}</AppText>}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        <Badge label={c.dc ? 'DC' : 'AC'} tone={c.dc ? 'lime' : 'card'} />
        {sockets.map((k) => <Badge key={k} label={c.sockets[k]! > 1 ? `${SOCKET_LABEL[k]} ×${c.sockets[k]}` : SOCKET_LABEL[k]} tone="card" />)}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          {c.name !== title && <AppText size={13} numberOfLines={2}>{c.name}</AppText>}
          {!!facts && <AppText size={12} color={colors.muted} numberOfLines={2}>{facts}</AppText>}
        </View>
        <Icon name="chevron" size={18} color={colors.muted} />
      </View>
    </Tap>
  );
}
