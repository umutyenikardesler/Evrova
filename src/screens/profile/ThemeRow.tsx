import React from 'react';
import Segmented from '../../components/Segmented';
import { useApp } from '../../context/AppContext';
import { useTheme, type ThemeMode } from '../../theme/ThemeContext';

/** Görünüm ayarı: Sistem / Açık / Koyu. */
export default function ThemeRow() {
  const { t } = useApp();
  const { mode, setMode } = useTheme();
  return (
    <Segmented<ThemeMode>
      title={t('profile.appearance')}
      value={mode}
      onChange={setMode}
      options={[
        { value: 'system', label: t('profile.themeSystem') },
        { value: 'light', label: t('profile.themeLight') },
        { value: 'dark', label: t('profile.themeDark') },
      ]}
    />
  );
}
