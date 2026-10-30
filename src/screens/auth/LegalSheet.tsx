import React, { useEffect, useState } from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import { PrimaryButton } from '../../components/Buttons';
import Icon from '../../components/Icon';
import Tap from '../../components/Tap';
import { useApp } from '../../context/AppContext';
import { legalDoc, type LegalDocId } from '../../i18n/legal';
import { colors } from '../../theme/colors';

/**
 * Kullanım koşulları / gizlilik politikası paneli: alttan kayar, içerik kaydırılır ve en altında "Kabul ediyorum" butonu vardır.
 * `doc` null ise kapalıdır.
 */
export default function LegalSheet({ doc, accepted, onClose, onAccept }: {
  doc: LegalDocId | null; accepted: boolean; onClose: () => void; onAccept: () => void;
}) {
  const { t, lang } = useApp();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [progress] = useState(() => new Animated.Value(0));
  // Kapanış animasyonu bitene kadar son gösterilen metin ekranda kalır.
  const [shown, setShown] = useState<LegalDocId | null>(null);

  useEffect(() => {
    if (!doc) return;
    const open = setTimeout(() => {
      setShown(doc);
      Animated.timing(progress, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }, 0);
    return () => clearTimeout(open);
  }, [doc, progress]);

  const dismiss = (after: () => void) => {
    Animated.timing(progress, { toValue: 0, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(({ finished }) => {
      if (finished) { setShown(null); after(); }
    });
  };

  if (!shown) return null;
  const content = legalDoc(lang, shown);

  return (
    <Modal visible transparent animationType="none" onRequestClose={() => dismiss(onClose)}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', opacity: progress }}>
          <Pressable onPress={() => dismiss(onClose)} accessibilityLabel={t('common.back')} style={{ flex: 1 }} />
        </Animated.View>
        <Animated.View style={{
          height: '88%', backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderTopColor: colors.line,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) }],
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 12 }}>
            <AppText weight="extrabold" size={22} style={{ flex: 1, letterSpacing: -0.44 }}>{content.title}</AppText>
            <Tap onPress={() => dismiss(onClose)} accessibilityLabel={t('common.back')} pressedBg={colors.card2}
              style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
              <AppText weight="bold" size={15} color={colors.muted}>✕</AppText>
            </Tap>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: Math.max(insets.bottom, 16) + 8, gap: 16 }} showsVerticalScrollIndicator>
            <AppText size={12} color={colors.muted}>{content.updated}</AppText>
            <AppText size={14} style={{ lineHeight: 21 }}>{content.intro}</AppText>
            {content.sections.map((s) => (
              <View key={s.h} style={{ gap: 6 }}>
                <AppText weight="bold" size={15}>{s.h}</AppText>
                {s.p.map((para, i) => <AppText key={i} size={13} color={colors.muted} style={{ lineHeight: 20 }}>{para}</AppText>)}
              </View>
            ))}
            <View style={{ gap: 10, marginTop: 4 }}>
              {accepted && (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Icon name="check" size={16} color={colors.lime} strokeWidth={3} />
                  <AppText weight="semibold" size={13} color={colors.lime}>{t('auth.accepted')}</AppText>
                </View>
              )}
              <PrimaryButton label={t('auth.accept')} onPress={() => dismiss(onAccept)} />
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
