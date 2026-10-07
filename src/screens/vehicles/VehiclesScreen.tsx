import React, { useState } from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import { BackButton } from '../../components/Buttons';
import { ChipRow } from '../../components/Chips';
import { Page, ScreenTitle } from '../../components/Layout';
import Tap from '../../components/Tap';
import TextField from '../../components/TextField';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { useNav } from '../../navigation/NavContext';
import type { VehicleType } from '../../types';
import { brandOf, brandsOf, modelOf, modelsOf, trimOf } from '../../utils/brand';
import { modelImage } from '../../utils/vehicleImage';
import BrandRow from './BrandRow';
import VehicleCard from './VehicleCard';

/** Aramada büyük/küçük harf, aksan ve Türkçe i/ı farkı yok sayılır. */
const fold = (x: string) => x.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').toLowerCase();

const FILTERS: ('all' | VehicleType)[] = ['all', 'moto', 'car', 'van'];

/**
 * Kategori (Tümü / Motosiklet / Otomobil / Kamyonet) → Marka → Model → Paket → Detay.
 * Tek paketi olan model doğrudan detaya gider.
 */
export default function VehiclesScreen() {
  const { t, vehicles } = useApp();
  const nav = useNav();
  const { vehicleType: type, vehicleBrand: brand, vehicleModel: model } = nav;

  const [query, setQuery] = useState('');
  const words = fold(query).split(/s+/).filter(Boolean);
  const searching = !brand && words.length > 0;

  const ofType = vehicles.filter((v) => type === 'all' || v.type === type);
  const ofBrand = brand ? ofType.filter((v) => brandOf(v) === brand) : [];
  // Paketler en düşük fiyattan en yükseğe sıralanır.
  const versions = model ? ofBrand.filter((v) => modelOf(v) === model).sort((x, y) => x.prices[11] - y.prices[11]) : [];

  const title = model ? `${brand} ${model}` : brand;
  const onBack = model ? () => nav.setVehicleModel(null) : () => nav.setVehicleBrand(null);

  const openModel = (name: string) => {
    const list = ofBrand.filter((v) => modelOf(v) === name);
    if (list.length === 1) nav.openDetail(list[0].id);
    else nav.setVehicleModel(name);
  };

  // Arama: marka adı eşleşen markalar + (marka, model) eşleşen modeller; kelimelerin hepsi geçmeli.
  const hit = (text: string) => words.every((w) => fold(text).includes(w));
  const brandHits = searching ? brandsOf(ofType).filter((b) => hit(b.brand)) : [];
  const modelHits = searching
    ? brandsOf(ofType).flatMap((b) =>
        modelsOf(ofType.filter((v) => brandOf(v) === b.brand))
          .filter((m) => ofType.some((v) => brandOf(v) === b.brand && modelOf(v) === m.name && hit(`${b.brand} ${m.name} ${trimOf(v)}`)))
          .map((m) => ({ brand: b.brand, ...m })))
    : [];
  const openFound = (b: string, m: string) => {
    const list = ofType.filter((v) => brandOf(v) === b && modelOf(v) === m);
    if (list.length === 1) { nav.openDetail(list[0].id); return; }
    nav.setVehicleBrand(b);
    nav.setVehicleModel(m);
  };

  return (
    <Page>
      {brand ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <BackButton onPress={onBack} label={t('common.back')} />
          <AppText weight="extrabold" size={28} numberOfLines={2} style={{ flex: 1, letterSpacing: -0.56 }}>{title}</AppText>
        </View>
      ) : (
        <>
          <ScreenTitle>{t('vehicles.title')}</ScreenTitle>
          <ChipRow
            items={FILTERS.map((f) => ({
              key: f,
              label: f === 'all' ? t('common.all') : t(`types.${f}`),
              active: type === f,
              onPress: () => nav.setVehicleType(f),
            }))}
          />
          <View>
            <TextField value={query} onChangeText={setQuery} placeholder={t('vehicles.search')} autoCorrect={false} returnKeyType="search" height={46} style={{ paddingRight: 44 }} />
            {query.length > 0 && (
              <Tap onPress={() => setQuery('')} accessibilityLabel={t('vehicles.clear')} style={{ position: 'absolute', right: 0, top: 0, width: 46, height: 46, alignItems: 'center', justifyContent: 'center' }}>
                <AppText weight="bold" size={16} color={colors.muted}>✕</AppText>
              </Tap>
            )}
          </View>
        </>
      )}

      <View style={{ gap: 12 }}>
        {searching && brandHits.length === 0 && modelHits.length === 0 && (
          <AppText size={14} color={colors.muted} style={{ textAlign: 'center', paddingVertical: 24 }}>{t('vehicles.noResult')}</AppText>
        )}
        {searching &&
          brandHits.map((b) => (
            <BrandRow key={'b:' + b.brand} brand={b.brand} count={t('vehicles.modelCount', { n: b.count })} onPress={() => nav.setVehicleBrand(b.brand)}
              type={ofType.find((v) => brandOf(v) === b.brand)?.type} />
          ))}
        {searching &&
          modelHits.map((m) => (
            <BrandRow key={'m:' + m.brand + m.name} brand={`${m.brand} ${m.name}`} count={t('vehicles.versionCount', { n: m.count })} logoBrand={m.brand}
              type={ofType.find((v) => brandOf(v) === m.brand)?.type} onPress={() => openFound(m.brand, m.name)}
              image={modelImage(ofType.find((v) => brandOf(v) === m.brand && modelOf(v) === m.name)!)} />
          ))}
        {!brand && !searching &&
          brandsOf(ofType).map((b) => (
            <BrandRow key={b.brand} brand={b.brand} count={t('vehicles.modelCount', { n: b.count })} onPress={() => nav.setVehicleBrand(b.brand)}
              type={ofType.find((v) => brandOf(v) === b.brand)?.type} />
          ))}
        {brand && !model &&
          modelsOf(ofBrand).map((m) => (
            <BrandRow key={m.name} brand={m.name} count={t('vehicles.versionCount', { n: m.count })} onPress={() => openModel(m.name)} logoBrand={brand} type={ofBrand[0]?.type}
              image={modelImage(ofBrand.find((v) => modelOf(v) === m.name)!)} />
          ))}
        {model &&
          versions.map((v) => <VehicleCard key={v.id} vehicle={v} title={trimOf(v) || v.name} onPress={() => nav.openDetail(v.id)} />)}
      </View>
    </Page>
  );
}
