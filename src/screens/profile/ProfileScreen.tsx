import React from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import Icon from '../../components/Icon';
import { Card, Page, ScreenTitle } from '../../components/Layout';
import Tap from '../../components/Tap';
import ToggleSwitch from '../../components/ToggleSwitch';
import { useApp } from '../../context/AppContext';
import { useNav } from '../../navigation/NavContext';
import { colors } from '../../theme/colors';
import { formatPrice } from '../../utils/format';
import NameCard from './NameCard';
import CurrencyRow from './CurrencyRow';
import LanguageRow from './LanguageRow';
import ThemeRow from './ThemeRow';

function Stat({ value, label, onPress }: { value: number; label: string; onPress: () => void }) {
  return (
    <Tap onPress={onPress} pressedBg={colors.card2} style={{ width: '48.5%', backgroundColor: colors.card, borderRadius: 20, padding: 16 }}>
      <AppText weight="extrabold" size={28} color={colors.lime}>{String(value)}</AppText>
      <AppText size={13} color={colors.muted}>{label}</AppText>
    </Tap>
  );
}

function SettingRow({ title, sub, first, children, onPress }: {
  title: string; sub?: string; first?: boolean; children: React.ReactNode; onPress?: () => void;
}) {
  return (
    <Tap onPress={onPress} disabled={!onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderTopWidth: first ? 0 : 1, borderTopColor: colors.line }}>
      <View style={{ flex: 1 }}>
        <AppText weight="bold" size={14}>{title}</AppText>
        {sub ? <AppText size={12} color={colors.muted}>{sub}</AppText> : null}
      </View>
      {children}
    </Tap>
  );
}

export default function ProfileScreen() {
  const { t, lang, currency, rates, profile, logout, toggleNotif, toggleCompact } = useApp();
  const nav = useNav();
  const watchCount = profile?.watch.length ?? 0;
  const alarmCount = (profile?.watch ?? []).filter((id) => profile?.alarms[id]).length;

  return (
    <Page>
      <ScreenTitle>{t('profile.title')}</ScreenTitle>

      <NameCard />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Stat value={watchCount} label={t('profile.watched')} onPress={() => nav.go('prices')} />
        <Stat value={alarmCount} label={t('profile.alarms')} onPress={() => nav.go('prices')} />
      </View>

      <Card style={{ paddingVertical: 4, paddingHorizontal: 16 }}>
        <SettingRow first title={t('profile.notifications')} sub={t('profile.notificationsSub')}>
          <ToggleSwitch value={!!profile?.notif} onToggle={toggleNotif} label={t('profile.notifications')} />
        </SettingRow>
        <SettingRow title={t('profile.compact')} sub={t('profile.compactSub', { example: formatPrice(1650000, lang, true, currency, rates) })}>
          <ToggleSwitch value={!!profile?.compact} onToggle={toggleCompact} label={t('profile.compact')} />
        </SettingRow>
        <LanguageRow />
        <ThemeRow />
        <CurrencyRow />
      </Card>

      <Tap onPress={logout} pressedBg="#e5714a"
        style={{ height: 50, borderRadius: 14, backgroundColor: colors.up, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Icon name="logout" size={18} color={colors.bg} strokeWidth={2.2} />
        <AppText weight="bold" size={15} color={colors.bg}>{t('profile.logout')}</AppText>
      </Tap>
    </Page>
  );
}
