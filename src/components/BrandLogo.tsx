import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { BRAND_LOGOS } from '../data/brandLogos';
import { colors } from '../theme/colors';
import AppText from './AppText';

/** "Škoda" -> "skoda", "Mercedes-Benz" -> "mercedes-benz" (assets/brands dosya adı). */
export const brandSlug = (brand: string) =>
  brand.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Aynı markanın kategoriye özel logosu varsa (ör. honda-moto) onu, yoksa marka logosunu döndürür. */
export const logoFor = (brand: string, type?: string) =>
  (type && BRAND_LOGOS[`${brandSlug(brand)}-${type}`]) || BRAND_LOGOS[brandSlug(brand)];

export const hasLogo = (brand: string) => brandSlug(brand) in BRAND_LOGOS;

/** Marka logosu (beyaz yuvarlak köşeli kutuda); logo yoksa baş harf. */
export default function BrandLogo({ brand, type, size = 56 }: { brand: string; type?: string; size?: number }) {
  const xml = logoFor(brand, type);
  if (!xml) {
    return (
      <View style={{ width: size, height: size, borderRadius: 16, backgroundColor: colors.limeSoft, alignItems: 'center', justifyContent: 'center' }}>
        <AppText weight="extrabold" size={size * 0.43} color={colors.lime}>{brand.charAt(0).toUpperCase()}</AppText>
      </View>
    );
  }
  const w = size * 0.8; // geniş logolar (Togg, KGM) için daha fazla genişlik
  const h = size * 0.68;
  return (
    <View style={{ width: size, height: size, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line }}>
      <SvgXml xml={xml} width={w} height={h} />
    </View>
  );
}
