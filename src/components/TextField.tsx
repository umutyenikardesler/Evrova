import React, { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { colors, fonts } from '../theme/colors';

interface Props extends TextInputProps {
  error?: boolean;
  height?: number;
}

export default function TextField({ error, height = 50, style, ...rest }: Props) {
  const [focus, setFocus] = useState(false);
  return (
    <TextInput
      placeholderTextColor={colors.placeholder}
      autoCapitalize="none"
      {...rest}
      onFocus={(e) => { setFocus(true); rest.onFocus?.(e); }}
      onBlur={(e) => { setFocus(false); rest.onBlur?.(e); }}
      style={[
        {
          height, borderRadius: 14, borderWidth: 1, backgroundColor: colors.card, color: colors.ink,
          paddingHorizontal: 16, fontFamily: fonts.medium, fontSize: 15,
          borderColor: error ? colors.up : focus ? colors.lime : colors.line,
        },
        style,
      ]}
    />
  );
}
