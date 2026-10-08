import React from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import { ChipScroller } from '../../components/Chips';
import Pagination from '../../components/Pagination';
import { Eyebrow, Page, ScreenTitle } from '../../components/Layout';
import Tap from '../../components/Tap';
import { NEWS_CATS } from '../../data/news';
import { useApp } from '../../context/AppContext';
import { useNav } from '../../navigation/NavContext';
import { colors } from '../../theme/colors';
import type { NewsItem } from '../../types';
import NewsPhoto from './NewsPhoto';

/** Sayfa başına haber: Tümü'nde 10, kategorilerde 7. */
const PAGE_SIZE = { all: 10, cat: 7 };

export default function NewsScreen() {
  const { t, lang, news } = useApp();
  const nav = useNav();
  const cat = nav.newsCat;

  const catLabel = (id: string) => NEWS_CATS.find((c) => c.id === id)?.label[lang] ?? id;
  const all = news.filter((n) => cat === 'all' || n.cat === cat).sort((a, b) => b.published.localeCompare(a.published));
  const size = cat === 'all' ? PAGE_SIZE.all : PAGE_SIZE.cat;
  const pages = Math.max(1, Math.ceil(all.length / size));
  const page = Math.min(nav.newsPage, pages);
  const list = all.slice((page - 1) * size, page * size);
  const [lead, ...rest] = list;

  const meta = (n: NewsItem) => `${n.date[lang]} · ${n.readMin} ${lang === 'tr' ? 'dk' : 'min'}`;

  return (
    <Page>
      <ScreenTitle>{t('news.title')}</ScreenTitle>
      <ChipScroller
        fade
        items={[{ id: 'all', label: t('common.all') }, ...NEWS_CATS.map((c) => ({ id: c.id, label: c.label[lang] }))].map((c) => ({
          key: c.id, label: c.label, active: cat === c.id, onPress: () => nav.setNewsCat(c.id),
        }))}
      />

      {lead && (
        <Tap onPress={() => nav.openNews(lead.id)} pressedBg={colors.card2}
          style={{ backgroundColor: colors.card, borderRadius: 22, paddingTop: 12, paddingHorizontal: 12, paddingBottom: 18, gap: 14 }}>
          <NewsPhoto item={lead} label={t('common.newsImage')} height={170} radius={16} />
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
            <NewsPhoto item={n} label={t('common.image')} height={72} radius={14} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Eyebrow>{catLabel(n.cat)}</Eyebrow>
            <AppText weight="bold" size={15} style={{ lineHeight: 20 }}>{n.title[lang]}</AppText>
            <AppText size={12} color={colors.muted} style={{ marginTop: 4 }}>{meta(n)}</AppText>
          </View>
        </Tap>
      ))}

      <Pagination page={page} total={pages} onChange={nav.setNewsPage} />
    </Page>
  );
}
