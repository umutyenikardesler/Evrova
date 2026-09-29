import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import Icon from '../../components/Icon';
import Toast from '../../components/Toast';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import LoginBackground from './LoginBackground';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import SimStats from './SimStats';
import { useAuthForm } from './useAuthForm';

export default function LoginScreen() {
  const { t } = useApp();
  const insets = useSafeAreaInsets();
  const form = useAuthForm();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <LoginBackground />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}>
          <View style={{ paddingHorizontal: 22, paddingTop: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="zap" size={22} color={colors.bg} strokeWidth={2.2} />
            </View>
            <View>
              <AppText weight="extrabold" size={20} style={{ lineHeight: 22 }}>EVROVA</AppText>
              <AppText size={12} color={colors.muted}>{t('auth.tagline')}</AppText>
            </View>
          </View>
          <SimStats />
          <View style={{ flex: 1, minHeight: 24 }} />
          {form.mode === 'signup' ? <SignupForm f={form} /> : <LoginForm f={form} />}
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast bottom={40} />
    </View>
  );
}
