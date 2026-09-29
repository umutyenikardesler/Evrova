import React, { useEffect, useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { colors } from '../theme/colors';

export default function ToggleSwitch({ value, onToggle, label }: { value: boolean; onToggle: () => void; label: string }) {
  const x = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(x, { toValue: value ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [value, x]);

  return (
    <Pressable onPress={onToggle} accessibilityRole="switch" accessibilityState={{ checked: value }} accessibilityLabel={label}>
      <Animated.View
        style={{
          width: 50, height: 30, borderRadius: 999,
          backgroundColor: x.interpolate({ inputRange: [0, 1], outputRange: [colors.track, colors.lime] }),
        }}>
        <Animated.View
          style={{
            position: 'absolute', top: 3, width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff',
            left: x.interpolate({ inputRange: [0, 1], outputRange: [3, 23] }),
          }}
        />
      </Animated.View>
    </Pressable>
  );
}
