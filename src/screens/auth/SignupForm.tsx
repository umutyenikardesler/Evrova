import React from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import { BackButton, LinkButton, PrimaryButton } from '../../components/Buttons';
import Icon from '../../components/Icon';
import TextField from '../../components/TextField';
import Tap from '../../components/Tap';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import SocialButton from './SocialButtons';
import { sheetStyle } from './sheet';
import type { AuthForm } from './useAuthForm';

export default function SignupForm({ f }: { f: AuthForm }) {
  const { t } = useApp();
  return (
    <View style={[sheetStyle, { paddingTop: 20, paddingBottom: 28, gap: 10 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <BackButton size={36} onPress={() => f.switchMode('login')} label={t('common.back')} />
        <View style={{ flex: 1 }}>
          <AppText weight="extrabold" size={22} style={{ letterSpacing: -0.44 }}>{t('auth.createAccount')}</AppText>
          <AppText size={12} color={colors.muted}>{t('auth.createSub')}</AppText>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TextField height={46} style={{ flex: 1 }} placeholder={t('auth.firstName')} value={f.firstName} onChangeText={f.setFirstName}
          error={f.errField === 'first'} autoCapitalize="words" autoComplete="given-name" textContentType="givenName" />
        <TextField height={46} style={{ flex: 1 }} placeholder={t('auth.lastName')} value={f.lastName} onChangeText={f.setLastName}
          error={f.errField === 'last'} autoCapitalize="words" autoComplete="family-name" textContentType="familyName" />
      </View>
      <TextField height={46} placeholder={t('auth.email')} value={f.email} onChangeText={f.setEmail} error={f.errField === 'email'}
        keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
      <TextField height={46} placeholder={t('auth.passwordNew')} value={f.password} onChangeText={f.setPassword} error={f.errField === 'pw'}
        secureTextEntry textContentType="newPassword" />
      <Tap onPress={f.toggleTerms} accessibilityRole="checkbox" accessibilityState={{ checked: f.terms }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 2 }}>
        <View style={{
          width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
          borderColor: f.errField === 'terms' ? colors.up : f.terms ? colors.lime : '#5b6a80',
          backgroundColor: f.terms ? colors.lime : 'transparent',
        }}>
          {f.terms && <Icon name="check" size={13} color={colors.bg} strokeWidth={3.5} />}
        </View>
        <AppText weight="medium" size={12} color={colors.muted} style={{ flex: 1, lineHeight: 17 }}>{t('auth.terms')}</AppText>
      </Tap>
      <AppText weight="semibold" size={12} color={colors.up} style={{ minHeight: 16 }}>{f.error}</AppText>
      <PrimaryButton label={f.loading ? t('auth.creating') : t('auth.signup')} onPress={f.submitSignup} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <SocialButton kind="apple" label="Apple" height={46} fontSize={14} onPress={f.social} style={{ flex: 1 }} />
        <SocialButton kind="google" label="Google" height={46} fontSize={14} onPress={f.social} style={{ flex: 1 }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
        <AppText size={13} color={colors.muted}>{t('auth.haveAccount')}</AppText>
        <LinkButton label={t('auth.login')} onPress={() => f.switchMode('login')} weight="bold" />
      </View>
    </View>
  );
}
