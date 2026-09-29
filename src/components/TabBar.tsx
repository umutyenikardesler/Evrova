import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useNav, type Tab } from '../navigation/NavContext';
import { colors } from '../theme/colors';
import Icon, { type IconName } from './Icon';
import Tap from './Tap';

const TABS: { tab: Tab; icon: IconName; label: 'nav.home' | 'nav.vehicles' | 'nav.news' | 'nav.prices' | 'nav.profile' }[] = [
  { tab: 'home', icon: 'home', label: 'nav.home' },
  { tab: 'vehicles', icon: 'car', label: 'nav.vehicles' },
  { tab: 'news', icon: 'news', label: 'nav.news' },
  { tab: 'prices', icon: 'heart', label: 'nav.prices' },
  { tab: 'profile', icon: 'user', label: 'nav.profile' },
];

export default function TabBar() {
  const { t } = useApp();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 12) }}>
      <View style={{ backgroundColor: colors.card, borderRadius: 20, height: 60, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {TABS.map(({ tab, icon, label }) => {
          const on = nav.tab === tab;
          return (
            <Tap key={tab} onPress={() => nav.go(tab)} accessibilityLabel={t(label)}
              style={{ width: 52, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.limeSoft : 'transparent' }}>
              <Icon name={icon} size={22} color={on ? colors.lime : colors.muted} />
            </Tap>
          );
        })}
      </View>
    </View>
  );
}
