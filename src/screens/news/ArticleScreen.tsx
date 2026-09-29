import React from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import { BackButton } from '../../components/Buttons';
import { Pill } from '../../components/Chips';
import { Page, PhotoPlaceholder } from '../../components/Layout';
import { useApp } from '../../context/AppContext';
import { NEWS_CATS } from '../../data/news';
import { useNav } from '../../navigation/NavContext';
import { colors } from '../../theme/colors';

export default function ArticleScreen({ id }: { id: string }) {
  const { t, lang, news } = useApp();
  const nav = useNav();
  const a = news.find((n) => n.id === id);
  if (!a) return null;
  const cat = NEWS_CATS.find((c) => c.id === a.cat)?.label[lang] ?? a.cat;
  const read = `${a.readMin} ${lang === 'tr' ? 'dk' : 'min'}`;

  return (
    <Page top={6} bottom={28}>
      <View style={{ alignSelf: 'flex-start' }}>
        <BackButton onPress={nav.closeArticle} label={t('common.back')} />
      </View>
      <View style={{ alignSelf: 'flex-start' }}><Pill label={cat} /></View>
      <AppText weight="extrabold" size={26} style={{ lineHeight: 31, letterSpacing: -0.52 }}>{a.title[lang]}</AppText>
      <AppText size={12} color={colors.muted}>{a.date[lang]} · {t('news.read', { min: read })}</AppText>
      <PhotoPlaceholder label={t('common.newsImage')} height={200} />
      {a.body[lang].map((para, i) => (
        <AppText key={i} size={16} color={colors.body} style={{ lineHeight: 26 }}>{para}</AppText>
      ))}
    </Page>
  );
}
