import React, { useRef, useState } from 'react';
import { Image, Linking, ScrollView, View } from 'react-native';
import AppText from '../../components/AppText';
import { PhotoPlaceholder } from '../../components/Layout';
import Tap from '../../components/Tap';
import { useApp } from '../../context/AppContext';
import type { VehicleImage } from '../../data/vehicleImages';
import { swipeLockProps } from '../../navigation/swipeLock';
import { colors } from '../../theme/colors';

const HEIGHT = 200;

/**
 * Araç detayındaki fotoğraf slider'ı: yana kaydırılır, araç kırpılmadan görünür, köşeler yuvarlaktır.
 * Altında nokta göstergesi ve o fotoğrafın atıf satırı bulunur.
 */
export default function DetailPhoto({ images }: { images: VehicleImage[] }) {
  const { t } = useApp();
  const [w, setW] = useState(0);
  const [idx, setIdx] = useState(0);
  const scroller = useRef<ScrollView>(null);

  if (images.length === 0) return <PhotoPlaceholder label={t('common.photo')} height={HEIGHT} />;
  const cur = images[Math.min(idx, images.length - 1)];

  return (
    <View style={{ gap: 8 }}>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} {...swipeLockProps}
        style={{ height: HEIGHT, borderRadius: 22, overflow: 'hidden', backgroundColor: colors.card }}>
        {w > 0 && (
          <ScrollView ref={scroller} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / w))}
            onScroll={(e) => { const i = Math.round(e.nativeEvent.contentOffset.x / w); if (i !== idx) setIdx(i); }}
            scrollEventThrottle={32}>
            {images.map((im) => (
              <Image key={im.title} source={im.src} style={{ width: w, height: HEIGHT }} resizeMode="contain" accessibilityIgnoresInvertColors />
            ))}
          </ScrollView>
        )}
      </View>

      {images.length > 1 && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
          {images.map((im, i) => (
            <Tap key={im.title} hitSlop={8} onPress={() => { setIdx(i); scroller.current?.scrollTo({ x: i * w, animated: true }); }}
              style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === idx ? colors.lime : colors.track }} />
          ))}
        </View>
      )}

      <Tap onPress={() => cur.page && Linking.openURL(cur.page)} disabled={!cur.page} hitSlop={6}>
        <AppText size={10} color={colors.muted} numberOfLines={1}>
          {t('detail.photoBy', { author: cur.author, license: cur.license })}
        </AppText>
      </Tap>
    </View>
  );
}
