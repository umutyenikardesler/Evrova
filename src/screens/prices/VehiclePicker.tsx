import React, { useState } from 'react';
import { Animated, Easing, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import Icon from '../../components/Icon';
import Tap from '../../components/Tap';
import TextField from '../../components/TextField';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { fold } from '../../utils/text';

interface Item { id: string; name: string }

/**
 * Takip edilen araçlardan birini seçer. Üstte yalnızca seçili araç görünür; dokununca arama kutulu
 * bir liste açılır, böylece onlarca araç takipteyken de başlık tek satır kalır.
 */
export default function VehiclePicker({ items, selectedId, onSelect }: { items: Item[]; selectedId: string; onSelect: (id: string) => void }) {
  const { t } = useApp();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  // Karartma solarak, liste alttan kayarak açılır (Modal'ın kendi "slide" animasyonu karartmayı da kaydırır).
  const [progress] = useState(() => new Animated.Value(0));
  const [query, setQuery] = useState('');
  const selected = items.find((i) => i.id === selectedId);

  const words = fold(query).split(/\s+/).filter(Boolean);
  const shown = items.filter((i) => words.every((w) => fold(i.name).includes(w)));

  const show = () => {
    setOpen(true);
    Animated.timing(progress, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  };
  const close = () => {
    Animated.timing(progress, { toValue: 0, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(({ finished }) => {
      if (finished) { setOpen(false); setQuery(''); }
    });
  };
  const pick = (id: string) => { onSelect(id); close(); };

  return (
    <>
      <Tap onPress={show} accessibilityRole="button" accessibilityLabel={t('prices.pick')} pressedBg={colors.card2}
        style={{ height: 46, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 16, paddingRight: 12 }}>
        <AppText weight="bold" size={15} numberOfLines={1} style={{ flex: 1 }}>{selected?.name ?? t('prices.pick')}</AppText>
        {items.length > 1 && (
          <View style={{ backgroundColor: colors.limeSoft, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 }}>
            <AppText weight="semibold" size={12} color={colors.lime}>{items.length}</AppText>
          </View>
        )}
        <View style={{ transform: [{ rotate: '90deg' }] }}><Icon name="chevron" size={20} color={colors.muted} /></View>
      </Tap>

      <Modal visible={open} transparent animationType="none" onRequestClose={close}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', opacity: progress }}>
            <Pressable onPress={close} accessibilityLabel={t('common.back')} style={{ flex: 1 }} />
          </Animated.View>
          <Animated.View style={{ maxHeight: '75%', transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) }], backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 16, paddingBottom: Math.max(insets.bottom, 12) }}>
            <View style={{ paddingHorizontal: 18, gap: 12, paddingBottom: 8 }}>
              <AppText weight="extrabold" size={20}>{t('prices.pick')}</AppText>
              <TextField value={query} onChangeText={setQuery} placeholder={t('vehicles.search')} autoCorrect={false} returnKeyType="search" height={46} />
            </View>
            <FlatList
              data={shown}
              keyExtractor={(i) => i.id}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<AppText size={14} color={colors.muted} style={{ textAlign: 'center', paddingVertical: 24 }}>{t('vehicles.noResult')}</AppText>}
              renderItem={({ item }) => {
                const active = item.id === selectedId;
                return (
                  <Tap onPress={() => pick(item.id)} pressedBg={colors.card2} accessibilityRole="button"
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 18 }}>
                    <AppText weight={active ? 'extrabold' : 'medium'} size={15} color={active ? colors.lime : colors.ink} numberOfLines={1} style={{ flex: 1 }}>{item.name}</AppText>
                    {active && <Icon name="check" size={20} color={colors.lime} strokeWidth={2.4} />}
                  </Tap>
                );
              }}
            />
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
