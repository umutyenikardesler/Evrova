import React from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import { BackButton } from '../../components/Buttons';
import { ChipRow } from '../../components/Chips';
import { Page, ScreenTitle } from '../../components/Layout';
import { useApp } from '../../context/AppContext';
import { useNav } from '../../navigation/NavContext';
import type { VehicleType } from '../../types';
import { brandOf, brandsOf, modelOf, modelsOf, trimOf } from '../../utils/brand';
import BrandRow from './BrandRow';
import VehicleCard from './VehicleCard';

const FILTERS: ('all' | VehicleType)[] = ['all', 'moto', 'car', 'van'];

/**
 * Kategori (Tümü / Motosiklet / Otomobil / Kamyonet) → Marka → Model → Paket → Detay.
 * Tek paketi olan model doğrudan detaya gider.
 */
export default function VehiclesScreen() {
  const { t, vehicles } = useApp();
  const nav = useNav();
  const { vehicleType: type, vehicleBrand: brand, vehicleModel: model } = nav;

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
        </>
      )}

      <View style={{ gap: 12 }}>
        {!brand &&
          brandsOf(ofType).map((b) => (
            <BrandRow key={b.brand} brand={b.brand} count={t('vehicles.modelCount', { n: b.count })} onPress={() => nav.setVehicleBrand(b.brand)} />
          ))}
        {brand && !model &&
          modelsOf(ofBrand).map((m) => (
            <BrandRow key={m.name} brand={m.name} count={t('vehicles.versionCount', { n: m.count })} onPress={() => openModel(m.name)} />
          ))}
        {model &&
          versions.map((v) => <VehicleCard key={v.id} vehicle={v} title={trimOf(v) || v.name} onPress={() => nav.openDetail(v.id)} />)}
      </View>
    </Page>
  );
}
