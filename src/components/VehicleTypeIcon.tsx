import React from 'react';
import { View } from 'react-native';
import { colors } from '../theme/colors';
import type { VehicleType } from '../types';
import Icon from './Icon';

export default function VehicleTypeIcon({ type }: { type: VehicleType }) {
  return (
    <View style={{ width: 76, height: 76, borderRadius: 16, backgroundColor: colors.limeSoft, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={type} size={30} color={colors.lime} />
    </View>
  );
}
