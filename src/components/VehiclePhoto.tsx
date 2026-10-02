import React from 'react';
import { Image, View } from 'react-native';
import { colors } from '../theme/colors';
import type { VehicleImage } from '../data/vehicleImages';

/** Liste satırlarındaki küçük araç fotoğrafı: araç kırpılmadan alana sığacak şekilde küçültülür. */
export default function VehiclePhoto({ image, width = 92, height = 68, children }: {
  image?: VehicleImage; width?: number; height?: number; children?: React.ReactNode;
}) {
  return (
    <View style={{ width, height, borderRadius: 14, overflow: 'hidden', backgroundColor: colors.card2, alignItems: 'center', justifyContent: 'center' }}>
      {image ? <Image source={image.src} style={{ width, height }} resizeMode="contain" accessibilityIgnoresInvertColors /> : children}
    </View>
  );
}
