import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import { BackButton, PrimaryButton } from '../../components/Buttons';
import { ChipRow } from '../../components/Chips';
import { Card, Page } from '../../components/Layout';
import StickyBlock from '../../components/StickyBlock';
import Tap from '../../components/Tap';
import TextField from '../../components/TextField';
import { useApp } from '../../context/AppContext';
import { CHARGERS } from '../../data/chargerData';
import { useNav } from '../../navigation/NavContext';
import { colors } from '../../theme/colors';
import { distanceM } from '../../utils/geo';
import { fold } from '../../utils/text';
import ChargerCard from './ChargerCard';
import { useUserLocation } from './useUserLocation';

type Filter = 'all' | 'dc' | 'ac';
const FILTERS: Filter[] = ['all', 'dc', 'ac'];
const PAGE = 30;

/** Şarj noktaları: konuma göre sıralı liste, arama ve hızlı/yavaş filtresi; karta dokununca yol tarifi. */
export default function ChargingScreen() {
  const { t } = useApp();
  const nav = useNav();
  const { coords, place, status, request } = useUserLocation();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [limit, setLimit] = useState(PAGE);

  const rows = useMemo(() => {
    const words = fold(query).split(/\s+/).filter(Boolean);
    const list = CHARGERS
      .filter((c) => filter === 'all' || (filter === 'dc' ? c.dc : !c.dc))
      .filter((c) => {
        const hay = fold(`${c.name} ${c.operator} ${c.district ?? ''} ${c.city ?? ''}`);
        return words.every((w) => hay.includes(w));
      })
      .map((c) => ({ c, d: coords ? distanceM(coords, c) : undefined }));
    // Konum varsa yakından uzağa; yoksa hızlı şarj önce, sonra ada göre.
    return list.sort((a, b) => (a.d !== undefined && b.d !== undefined ? a.d - b.d : Number(b.c.dc) - Number(a.c.dc) || a.c.name.localeCompare(b.c.name, 'tr')));
  }, [query, filter, coords]);

  const hint = status === 'denied' ? t('charging.denied') : status === 'unavailable' ? t('charging.unavailable') : status === 'failed' ? t('charging.failed') : t('charging.locationHint');

  return (
    <Page top={6}>
      <StickyBlock>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <BackButton onPress={() => nav.go('home')} label={t('common.back')} />
          <AppText weight="extrabold" size={24} style={{ flex: 1, letterSpacing: -0.48 }}>{t('charging.title')}</AppText>
        </View>
        <View>
          <TextField value={query} onChangeText={(v) => { setQuery(v); setLimit(PAGE); }} placeholder={t('charging.search')} autoCorrect={false} returnKeyType="search" height={46} style={{ paddingRight: 44 }} />
          {query.length > 0 && (
            <Tap onPress={() => { setQuery(''); setLimit(PAGE); }} accessibilityLabel={t('vehicles.clear')} style={{ position: 'absolute', right: 0, top: 0, width: 46, height: 46, alignItems: 'center', justifyContent: 'center' }}>
              <AppText weight="bold" size={16} color={colors.muted}>✕</AppText>
            </Tap>
          )}
        </View>
        <ChipRow items={FILTERS.map((f) => ({ key: f, label: t(`charging.${f}`), active: filter === f, onPress: () => { setFilter(f); setLimit(PAGE); } }))} />
      </StickyBlock>

      {coords ? (
        <Card style={{ borderRadius: 20, padding: 16, gap: 4 }}>
          {!!place && (
            <>
              <AppText weight="semibold" size={12} color={colors.muted}>{t('charging.yourLocation')}</AppText>
              <AppText weight="extrabold" size={18}>{place}</AppText>
            </>
          )}
          <AppText size={13} color={colors.muted}>{t('charging.nearest')} · {t('charging.count', { n: rows.length })}</AppText>
        </Card>
      ) : (
        <Card style={{ borderRadius: 20, padding: 16, gap: 10 }}>
          <AppText size={13} color={colors.muted}>{hint}</AppText>
          {status !== 'unavailable' && (
            <View style={{ alignSelf: 'flex-start' }}>
              <PrimaryButton label={status === 'loading' ? t('charging.locating') : t('charging.useLocation')} height={44} fontSize={14} onPress={request}
                style={{ paddingHorizontal: 18, borderRadius: 12, opacity: status === 'loading' ? 0.7 : 1 }} />
            </View>
          )}
        </Card>
      )}

      <View style={{ gap: 12 }}>
        {rows.length === 0 && <AppText size={14} color={colors.muted} style={{ textAlign: 'center', paddingVertical: 24 }}>{t('charging.noResult')}</AppText>}
        {rows.slice(0, limit).map(({ c, d }) => <ChargerCard key={c.id} charger={c} distanceM={d} />)}
        {rows.length > limit && (
          <Tap onPress={() => setLimit((n) => n + PAGE)} pressedBg={colors.card2}
            style={{ height: 46, borderRadius: 14, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
            <AppText weight="bold" size={14}>{t('charging.more')}</AppText>
          </Tap>
        )}
      </View>

      <AppText size={11} color={colors.muted}>{t('charging.credit')}</AppText>
    </Page>
  );
}
