import React from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import { LinkButton, PrimaryButton } from '../../components/Buttons';
import TextField from '../../components/TextField';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import SocialButton from './SocialButtons';
import { sheetStyle } from './sheet';
import type { AuthForm } from './useAuthForm';

export default function LoginForm({ f }: { f: AuthForm }) {
  const { t } = useApp();
  return (
    <View style={[sheetStyle, { paddingTop: 22, paddingBottom: 30, gap: 11 }]}>
      <View>
        <AppText weight="extrabold" size={24} style={{ letterSpacing: -0.48 }}>{t('auth.welcome')}</AppText>
        <AppText size={13} color={colors.muted} style={{ marginTop: 2 }}>{t('auth.welcomeSub')}</AppText>
      </View>
      <TextField placeholder={t('auth.email')} value={f.email} onChangeText={f.setEmail} error={f.errField === 'email'}
        keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
      <TextField placeholder={t('auth.password')} value={f.password} onChangeText={f.setPassword} error={f.errField === 'pw'}
        secureTextEntry autoComplete="password" textContentType="password" onSubmitEditing={f.submitLogin} returnKeyType="go" />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, minHeight: 18 }}>
        <AppText weight="semibold" size={12} color={colors.up} style={{ flex: 1 }}>{f.error}</AppText>
        <LinkButton label={t('auth.forgot')} onPress={f.forgot} size={12} />
      </View>
      <PrimaryButton label={f.loading ? t('auth.loggingIn') : t('auth.login')} onPress={f.submitLogin} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
        <AppText size={12} color={colors.muted}>{t('auth.or')}</AppText>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
      </View>
      <SocialButton kind="apple" label={t('auth.apple')} onPress={f.social} />
      <SocialButton kind="google" label={t('auth.google')} onPress={f.social} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 2 }}>
        <AppText size={13} color={colors.muted}>{t('auth.noAccount')}</AppText>
        <LinkButton label={t('auth.signup')} onPress={() => f.switchMode('signup')} weight="bold" />
      </View>
    </View>
  );
}
