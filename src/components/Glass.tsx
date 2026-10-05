import { requireOptionalNativeModule } from 'expo';
import { BlurTargetView, BlurView } from 'expo-blur';
import React from 'react';
import { Platform, View, type ViewProps } from 'react-native';

/**
 * expo-blur'un yerel (native) kodu uygulamanın build'inde var mı?
 * Eski bir development build'de modül yoksa BlurView "Unimplemented component" hatası verir;
 * bu durumda bulanıklık atlanır, menü yarı saydam düz zemin olarak çizilir.
 * (Yeni build alındıktan sonra otomatik olarak gerçek cam efekti kullanılır.)
 */
export const blurAvailable: boolean = (() => {
  if (Platform.OS === 'web') return true;
  try {
    return !!requireOptionalNativeModule('ExpoBlur');
  } catch {
    return false;
  }
})();

/** Android'de BlurView'in bulanıklaştıracağı içerik kapsayıcısı (yoksa düz View). */
export const GlassTarget = (blurAvailable ? BlurTargetView : View) as React.ComponentType<ViewProps & { ref?: React.Ref<View> }>;

/** Bulanık cam katmanı (yerel modül yoksa hiçbir şey çizmez). */
export const GlassBlur = (blurAvailable ? BlurView : () => null) as typeof BlurView;
