import React, { useState } from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import { ChipScroller } from '../../components/Chips';
import { Eyebrow, Page, PhotoPlaceholder, ScreenTitle } from '../../components/Layout';
import Tap from '../../components/Tap';
import { NEWS_CATS } from '../../data/news';
import { useApp } from '../../context/AppContext';
import { useNav } from '../../navigation/NavContext';
import { colors } from '../../theme/colors';
import type { NewsItem } from '../../types';

export default function NewsScreen() {
  const { t, lang, news } = useApp();
  const nav = useNav();
  const [cat, setCat] = useState('all');

  const catLabel = (id: string) => NEWS_CATS.find((c) => c.id === id)?.label[lang] ?? id;
  const list = news.filter((n) => cat === 'all' || n.cat === cat);
  const [lead, ...rest] = list;

  const meta = (n: NewsItem) => `${n.date[lang]} · ${n.readMin} ${lang === 'tr' ? 'dk' : 'min'}`;

  return (
    <Page>
      <ScreenTitle>{t('news.title')}</ScreenTitle>
      <ChipScroller
        fade
        items={[{ id: 'all', label: t('common.all') }, ...NEWS_CATS.map((c) => ({ id: c.id, label: c.label[lang] }))].map((c) => ({
          key: c.id, label: c.label, active: cat === c.id, onPress: () => setCat(c.id),
        }))}
      />

      {lead && (
        <Tap onPress={() => nav.openNews(lead.id)} pressedBg={colors.card2}
          style={{ backgroundColor: colors.card, borderRadius: 22, paddingTop: 12, paddingHorizontal: 12, paddingBottom: 18, gap: 14 }}>
          <PhotoPlaceholder label={t('common.newsImage')} height={170} radius={16} bg={colors.card2} />
          <View style={{ paddingHorizontal: 6 }}>
            <Eyebrow>{catLabel(lead.cat)}</Eyebrow>
            <AppText weight="extrabold" size={20} style={{ lineHeight: 25, marginTop: 4, marginBottom: 6 }}>{lead.title[lang]}</AppText>
            <AppText size={12} color={colors.muted}>{meta(lead)}</AppText>
          </View>
        </Tap>
      )}

      {rest.map((n) => (
        <Tap key={n.id} onPress={() => nav.openNews(n.id)} pressedBg={colors.card2}
          style={{ flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: colors.card, borderRadius: 20, padding: 12 }}>
          <View style={{ width: 72 }}>
            <PhotoPlaceholder label={t('common.image')} height={72} radius={14} bg={colors.card2} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Eyebrow>{catLabel(n.cat)}</Eyebrow>
            <AppText weight="bold" size={15} style={{ lineHeight: 20 }}>{n.title[lang]}</AppText>
            <AppText size={12} color={colors.muted} style={{ marginTop: 4 }}>{meta(n)}</AppText>
          </View>
        </Tap>
      ))}
    </Page>
  );
}
