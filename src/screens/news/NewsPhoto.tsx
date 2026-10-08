import React from 'react';
import { Image, View } from 'react-native';
import { PhotoPlaceholder } from '../../components/Layout';
import { colors } from '../../theme/colors';
import type { NewsItem } from '../../types';
import { newsPhoto } from '../../utils/newsPhoto';

/** Haberin görseli (kırpılarak alanı doldurur); görsel yoksa gri yer tutucu. */
export default function NewsPhoto({ item, height, radius = 22, label }: { item: Pick<NewsItem, 'id' | 'cat' | 'photo'>; height: number; radius?: number; label: string }) {
  const img = newsPhoto(item);
  if (!img) return <PhotoPlaceholder label={label} height={height} radius={radius} bg={colors.card2} />;
  return (
    <View style={{ height, borderRadius: radius, overflow: 'hidden', backgroundColor: colors.card2 }}>
      <Image source={img.src} style={{ width: '100%', height }} resizeMode="cover" accessibilityIgnoresInvertColors />
    </View>
  );
}
