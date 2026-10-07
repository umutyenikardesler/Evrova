import React, { useState } from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import { BackButton } from '../../components/Buttons';
import { Card, Page } from '../../components/Layout';
import { useApp } from '../../context/AppContext';
import { useNav } from '../../navigation/NavContext';
import { colors } from '../../theme/colors';
import TaxCalculator from './TaxCalculator';
import { MtvTable, OtvTable } from './TaxTables';

/** Vergi rehberi: ÖTV/MTV tabloları ve anahtar teslim fiyattan vergi hesaplayıcı. */
export default function TaxScreen() {
  const { t } = useApp();
  const nav = useNav();
  const [power, setPower] = useState('');
  const notes = [t('tax.note1'), t('tax.note2'), t('tax.note3')];
  return (
    <Page top={6}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <BackButton onPress={() => nav.go('home')} label={t('common.back')} />
        <AppText weight="extrabold" size={24} style={{ flex: 1, letterSpacing: -0.48 }}>{t('tax.title')}</AppText>
      </View>
      <AppText size={13} color={colors.muted}>{t('tax.intro')}</AppText>

      <TaxCalculator power={power} onPower={setPower} />
      <OtvTable />
      <MtvTable kw={Number(power) || 0} />

      <Card style={{ borderRadius: 22, padding: 16, gap: 8 }}>
        {notes.map((n, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
            <AppText size={13} color={colors.lime}>•</AppText>
            <AppText size={13} color={colors.muted} style={{ flex: 1 }}>{n}</AppText>
          </View>
        ))}
      </Card>
    </Page>
  );
}
