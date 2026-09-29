import React from 'react';
import Segmented from '../../components/Segmented';
import { useApp } from '../../context/AppContext';
import { SYMBOL, tlPer, type Currency } from '../../utils/currency';

const fmt = (n: number, lang: 'tr' | 'en') => n.toFixed(2).replace('.', lang === 'tr' ? ',' : '.');

/** Para birimi: TL / Dolar / Euro. Fiyatlar güncel kurla çevrilir. */
export default function CurrencyRow() {
  const { t, lang, currency, setCurrency, rates } = useApp();
  return (
    <Segmented<Currency>
      title={t('profile.currency')}
      value={currency}
      onChange={setCurrency}
      note={currency === 'TRY' ? undefined : t('profile.rateNote', {
        sym: SYMBOL[currency], rate: fmt(tlPer(currency, rates), lang), date: rates.date,
      })}
      options={[
        { value: 'TRY', label: 'TL (₺)' },
        { value: 'USD', label: 'USD ($)' },
        { value: 'EUR', label: 'EUR (€)' },
      ]}
    />
  );
}
