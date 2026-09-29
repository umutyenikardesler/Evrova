import React from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import { BackButton, LinkButton } from '../../components/Buttons';
import Icon, { type IconName } from '../../components/Icon';
import { Page } from '../../components/Layout';
import Tap from '../../components/Tap';
import { useApp } from '../../context/AppContext';
import { useNav } from '../../navigation/NavContext';
import { colors } from '../../theme/colors';
import type { AppNotification, NotifKind } from '../../types';
import { relativeTime } from '../../utils/format';

const ICON: Record<NotifKind, IconName> = { price: 'trending', news: 'news', system: 'zap' };

export default function NotificationsScreen() {
  const { t, lang, notifications, profile, markRead, markAllRead, isWatched, toggleWatch } = useApp();
  const nav = useNav();
  const isUnread = (n: AppNotification) => !profile?.readNotifs.includes(n.id);
  const hasUnread = notifications.some(isUnread);

  const open = (n: AppNotification) => {
    markRead(n.id);
    if (n.newsId) nav.openNews(n.newsId);
    else if (n.vehicleId) {
      // Bildirimdeki araç takipte değilse takibe ekle (tasarımdaki davranış).
      if (!isWatched(n.vehicleId)) toggleWatch(n.vehicleId);
      nav.openPrices(n.vehicleId);
    } else nav.go('vehicles');
  };

  return (
    <Page top={6}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <BackButton onPress={() => nav.go('home')} label={t('common.back')} />
        <AppText weight="extrabold" size={24} style={{ flex: 1, letterSpacing: -0.48 }}>{t('notifications.title')}</AppText>
        {hasUnread && <LinkButton label={t('notifications.readAll')} onPress={markAllRead} />}
      </View>

      <View style={{ gap: 10 }}>
        {notifications.length === 0 && <AppText size={13} color={colors.muted}>{t('notifications.empty')}</AppText>}
        {notifications.map((n) => {
          const unread = isUnread(n);
          return (
            <Tap key={n.id} onPress={() => open(n)} pressedBg={colors.card2}
              style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: unread ? colors.card : 'transparent', borderRadius: 18, padding: 14 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.limeSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={ICON[n.kind]} size={20} color={colors.lime} strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  <AppText weight="bold" size={14} style={{ flex: 1 }}>{n.title[lang]}</AppText>
                  <AppText size={11} color={colors.muted}>{relativeTime(n.createdAt, t)}</AppText>
                </View>
                <AppText size={13} color={colors.muted} style={{ marginTop: 2 }}>{n.text[lang]}</AppText>
              </View>
              {unread && <View style={{ width: 8, height: 8, marginTop: 6, borderRadius: 4, backgroundColor: colors.lime }} />}
            </Tap>
          );
        })}
      </View>
    </Page>
  );
}
