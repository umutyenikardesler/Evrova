import React from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import Icon from '../../components/Icon';
import Tap from '../../components/Tap';
import { useApp } from '../../context/AppContext';
import { useNav } from '../../navigation/NavContext';
import { colors } from '../../theme/colors';
import { nameParts } from '../../utils/name';

/** Ana sayfanın üst satırı; sayfa kaydırılsa da sabit kalır (MainShell içeriğin üstünde çizer). */
export default function HomeHeader() {
  const { t, profile, notifications } = useApp();
  const nav = useNav();
  const name = nameParts(profile).full;
  const hasUnread = notifications.some((n) => !profile?.readNotifs.includes(n.id));
  const initial = (name[0] ?? '?').toUpperCase();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 6, backgroundColor: colors.bg }}>
      <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="zap" size={24} color={colors.bg} strokeWidth={2.2} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText weight="extrabold" size={21} style={{ letterSpacing: 0.21, lineHeight: 23 }}>EVROVA</AppText>
        <AppText size={13} color={colors.muted}>{t('home.hello', { name })}</AppText>
      </View>
      <Tap onPress={() => nav.go('notif')} accessibilityLabel={t('nav.notifications')} pressedBg={colors.card}
        style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
        {hasUnread && (
          <View style={{ position: 'absolute', top: 5, right: 6, width: 13, height: 13, borderRadius: 7, backgroundColor: colors.lime, borderWidth: 2, borderColor: colors.bg, zIndex: 1 }} />
        )}
        <Icon name="bell" size={22} color={colors.ink} />
      </Tap>
      <Tap onPress={() => nav.go('profile')} accessibilityLabel={t('nav.profile')} pressedBg={colors.card2}
        style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: colors.lime, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
        <AppText weight="extrabold" size={15} color={colors.lime}>{initial}</AppText>
      </Tap>
    </View>
  );
}
