import React, { useEffect, useState } from 'react';
import { Animated, Keyboard, Modal, Platform, Pressable, useWindowDimensions, View } from 'react-native';
import AppText from '../../components/AppText';
import Tap from '../../components/Tap';
import PasswordField from '../../components/PasswordField';
import { useApp } from '../../context/AppContext';
import { accountKind, authErrorKey } from '../../firebase/auth';
import { SOCIAL_UNAVAILABLE } from '../../firebase/social';
import type { TKey } from '../../i18n';
import { colors } from '../../theme/colors';

const PROVIDER_NAME = { apple: 'Apple', google: 'Google' } as const;

const errorKey = (e: unknown): TKey =>
  ['auth/invalid-credential', 'auth/wrong-password'].includes((e as { code?: string })?.code ?? '') ? 'profile.errCurrent' : authErrorKey(e);

/** "Hesabı sil" butonu ve onay penceresi. Onaylanınca hesap silinir ve uygulama giriş ekranına döner. */
export default function DeleteAccount() {
  const { t, user, deleteAccount, showToast } = useApp();
  const kind = accountKind();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // iOS: klavye açılınca ortalı kutu hafifçe yukarı kayar (klavyenin dörtte biri), gerekiyorsa klavyenin altında kalmayacak kadar daha fazla.
  const { height: winH } = useWindowDimensions();
  const [kbH, setKbH] = useState(0);
  const [cardH, setCardH] = useState(0);
  const [lift] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    const show = Keyboard.addListener('keyboardWillShow', (e) => setKbH(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardWillHide', () => setKbH(0));
    return () => { show.remove(); hide.remove(); };
  }, []);
  useEffect(() => {
    const needed = kbH ? (winH + cardH) / 2 - (winH - kbH - 12) : 0;
    const target = kbH ? Math.max(kbH / 4, needed, 0) : 0;
    Animated.timing(lift, { toValue: -target, duration: 220, useNativeDriver: true }).start();
  }, [kbH, cardH, winH, lift]);

  const close = () => { if (!busy) { setOpen(false); setPassword(''); setError(''); } };

  const confirm = async () => {
    if (busy) return;
    if (kind === 'password' && !password) return setError(t('profile.deletePassword'));
    setError('');
    setBusy(true);
    try {
      // Başarılıysa kullanıcı oturumu kapanır ve giriş ekranı gösterilir (bu bileşen kaldırılır).
      await deleteAccount(kind === 'password' ? password : undefined);
    } catch (e) {
      setError((e as { code?: string })?.code === SOCIAL_UNAVAILABLE ? t('auth.socialSoon') : t(errorKey(e)));
      showToast(t('auth.errGeneric'));
    } finally {
      setBusy(false);
    }
  };

  if (!user) return null;
  return (
    <>
      <Tap onPress={() => setOpen(true)} accessibilityRole="button" pressedBg={colors.card2}
        style={{ height: 50, borderRadius: 14, borderWidth: 1, borderColor: colors.up, alignItems: 'center', justifyContent: 'center' }}>
        <AppText weight="bold" size={15} color={colors.up}>{t('profile.deleteAccount')}</AppText>
      </Tap>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 22 }}>
          <Pressable onPress={close} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} />
          <Animated.View onLayout={(e) => setCardH(e.nativeEvent.layout.height)}
            style={{ backgroundColor: colors.bg, borderRadius: 24, borderWidth: 1, borderColor: colors.line, padding: 20, gap: 12, transform: [{ translateY: lift }] }}>
            <AppText weight="extrabold" size={20}>{t('profile.deleteTitle')}</AppText>
            <AppText size={14} color={colors.muted} style={{ lineHeight: 20 }}>{t('profile.deleteText')}</AppText>
            {kind === 'password' ? (
              <PasswordField height={46} placeholder={t('profile.currentPassword')} value={password} onChangeText={(v) => { setPassword(v); setError(''); }} textContentType="password" error={!!error} />
            ) : kind === 'apple' || kind === 'google' ? (
              <AppText size={12} color={colors.muted}>{t('profile.deleteSocial', { provider: PROVIDER_NAME[kind] })}</AppText>
            ) : null}
            {!!error && <AppText weight="semibold" size={12} color={colors.up}>{error}</AppText>}
            <View style={{ gap: 10, marginTop: 4 }}>
              <Tap onPress={confirm} accessibilityRole="button" pressedBg="#e5714a"
                style={{ height: 48, borderRadius: 14, backgroundColor: colors.up, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.7 : 1 }}>
                <AppText weight="bold" size={15} color={colors.bg}>{busy ? t('profile.deleting') : t('profile.deleteConfirm')}</AppText>
              </Tap>
              <Tap onPress={close} accessibilityRole="button" pressedBg="#D5DAE3"
                style={{ height: 48, borderRadius: 14, backgroundColor: '#E6E9EF', borderWidth: 1, borderColor: '#B8C0CC', alignItems: 'center', justifyContent: 'center' }}>
                <AppText weight="bold" size={15} color="#101827">{t('profile.cancel')}</AppText>
              </Tap>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}
