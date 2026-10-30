import React, { useState } from 'react';
import { View, type TextInputProps } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import Icon from './Icon';
import Tap from './Tap';
import TextField from './TextField';

/** Şifre alanı: varsayılan olarak gizli; sağdaki göz simgesiyle yazılan şifre görülebilir. */
export default function PasswordField({ error, height = 50, style, ...rest }: Omit<TextInputProps, 'secureTextEntry'> & { error?: boolean; height?: number }) {
  const { t } = useApp();
  const [visible, setVisible] = useState(false);
  return (
    <View>
      <TextField {...rest} error={error} height={height} secureTextEntry={!visible} autoCorrect={false} style={[{ paddingRight: 48 }, style]} />
      <Tap onPress={() => setVisible((v) => !v)} accessibilityRole="button" accessibilityLabel={visible ? t('auth.hidePassword') : t('auth.showPassword')}
        style={{ position: 'absolute', right: 0, top: 0, width: 48, height, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={visible ? 'eyeOff' : 'eye'} size={20} color={colors.muted} />
      </Tap>
    </View>
  );
}
