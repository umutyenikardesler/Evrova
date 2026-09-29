import React from 'react';
import Segmented from '../../components/Segmented';
import { useApp } from '../../context/AppContext';
import type { Lang } from '../../i18n';

/** Dil ayarı: diller kendi adlarıyla listelenir. */
export default function LanguageRow() {
  const { t, lang, setLang } = useApp();
  return (
    <Segmented<Lang>
      title={t('profile.language')}
      value={lang}
      onChange={setLang}
      options={[
        { value: 'tr', label: 'Türkçe' },
        { value: 'en', label: 'English' },
      ]}
    />
  );
}
