import React, { useState } from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import { PrimaryButton } from '../../components/Buttons';
import Icon from '../../components/Icon';
import { Card } from '../../components/Layout';
import Tap from '../../components/Tap';
import PasswordField from '../../components/PasswordField';
import TextField from '../../components/TextField';
import { useApp } from '../../context/AppContext';
import DeleteAccount from './DeleteAccount';
import { accountKind, authErrorKey } from '../../firebase/auth';
import type { TKey } from '../../i18n';
import { colors } from '../../theme/colors';
import { nameParts } from '../../utils/name';
import { EMAIL_RE } from '../../utils/text';

/** Profil kartı: avatar, ad soyad, e-posta ve ad/soyad düzenleme. */
const PROVIDER_NAME = { apple: 'Apple', google: 'Google' } as const;

/** Mevcut şifre yanlışsa profile özgü mesaj; diğer hatalar genel eşlemeyle. */
const errorKey = (e: unknown): TKey =>
  ['auth/invalid-credential', 'auth/wrong-password'].includes((e as { code?: string })?.code ?? '') ? 'profile.errCurrent' : authErrorKey(e);

/** Profil kartı: avatar, ad soyad, e-posta; düzenleme modunda ad/soyad, e-posta ve şifre değiştirme. */
export default function NameCard() {
  const { t, profile, user, updateName, changeEmail, changePassword, createPassword, showToast } = useApp();
  const { firstName, lastName, full } = nameParts(profile ?? { name: user?.displayName ?? '' });
  const kind = accountKind();
  const social = kind === 'apple' || kind === 'google';
  const currentEmail = user?.email || profile?.email || '';

  const [editing, setEditing] = useState(false);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [newPw, setNewPw] = useState('');
  const [current, setCurrent] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const start = () => {
    setFirst(firstName);
    setLast(lastName);
    setEmail(currentEmail);
    setNewPw('');
    setCurrent('');
    setError('');
    setEditing(true);
  };

  const emailChanged = kind === 'password' && email.trim().toLowerCase() !== currentEmail.toLowerCase();
  const pwChanged = kind === 'password' && newPw.length > 0;
  const pwCreate = social && newPw.length > 0;

  const save = async () => {
    if (busy || first.trim().length < 1) return;
    setError('');
    if (emailChanged && !EMAIL_RE.test(email.trim())) return setError(t('auth.errEmail'));
    if ((pwChanged || pwCreate) && newPw.length < 6) return setError(t('auth.errPassword'));
    if ((emailChanged || pwChanged) && !current) return setError(t('profile.needCurrent'));
    setBusy(true);
    try {
      // E-posta önce: şifre değişirse mevcut şifre geçersiz olacağından yeniden doğrulama sırası önemli.
      if (emailChanged) await changeEmail(current, email.trim());
      if (pwChanged) await changePassword(current, newPw);
      // Sağlayıcı doğrulaması iptal edilirse hiçbir şey kaydedilmez, düzenleme açık kalır.
      if (pwCreate && !(await createPassword(newPw))) return;
      updateName(first, last);
      showToast(emailChanged ? t('profile.emailVerifySent') : pwChanged ? t('profile.passwordChanged') : pwCreate ? t('profile.passwordCreated') : t('profile.saved'));
      setEditing(false);
    } catch (e) {
      setError(t(errorKey(e)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={{ borderRadius: 22, padding: 14, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }}>
          <AppText weight="extrabold" size={26} color={colors.bg}>{(firstName[0] ?? '?').toUpperCase()}</AppText>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText weight="extrabold" size={19}>{full}</AppText>
          <AppText size={13} color={colors.muted}>{profile?.email || user?.email}</AppText>
        </View>
        <Tap onPress={editing ? () => setEditing(false) : start} accessibilityLabel={t('profile.editName')} pressedBg={colors.card2}
          style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="edit" size={18} color={colors.lime} />
        </Tap>
      </View>
      {editing && (
        <View style={{ gap: 10 }}>
          <TextField height={46} placeholder={t('auth.firstName')} value={first} onChangeText={setFirst} autoCapitalize="words" />
          <TextField height={46} placeholder={t('auth.lastName')} value={last} onChangeText={setLast} autoCapitalize="words" />
          <TextField height={46} placeholder={t('profile.email')} value={email} onChangeText={setEmail} editable={kind === 'password'}
            keyboardType="email-address" autoComplete="email" textContentType="emailAddress" style={kind === 'password' ? undefined : { opacity: 0.6 }} />
          {kind === 'password' ? (
            <>
              <PasswordField height={46} placeholder={t('profile.newPassword')} value={newPw} onChangeText={setNewPw} textContentType="newPassword" />
              <AppText size={12} color={colors.muted}>{t('profile.passwordHint')}</AppText>
              {(emailChanged || pwChanged) && (
                <PasswordField height={46} placeholder={t('profile.currentPassword')} value={current} onChangeText={setCurrent} textContentType="password" />
              )}
            </>
          ) : social ? (
            <>
              <PasswordField height={46} placeholder={t('profile.newPassword')} value={newPw} onChangeText={setNewPw} textContentType="newPassword" />
              <AppText size={12} color={colors.muted}>{t('profile.managedBy', { provider: PROVIDER_NAME[kind] })}</AppText>
            </>
          ) : null}
          {!!error && <AppText weight="semibold" size={12} color={colors.up}>{error}</AppText>}
          <PrimaryButton label={t('profile.save')} height={46} fontSize={15} onPress={save} style={{ opacity: busy ? 0.7 : 1 }} />
          <DeleteAccount />
        </View>
      )}
    </Card>
  );
}
