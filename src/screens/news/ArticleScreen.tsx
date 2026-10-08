import React from 'react';
import { Linking, View } from 'react-native';
import AppText from '../../components/AppText';
import { BackButton } from '../../components/Buttons';
import { Pill } from '../../components/Chips';
import { Page } from '../../components/Layout';
import Tap from '../../components/Tap';
import { newsPhoto } from '../../utils/newsPhoto';
import NewsPhoto from './NewsPhoto';
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
  const img = newsPhoto(a);
  const read = `${a.readMin} ${lang === 'tr' ? 'dk' : 'min'}`;

  return (
    <Page top={6} bottom={28}>
      <View style={{ alignSelf: 'flex-start' }}>
        <BackButton onPress={nav.closeArticle} label={t('common.back')} />
      </View>
      <View style={{ alignSelf: 'flex-start' }}><Pill label={cat} /></View>
      <AppText weight="extrabold" size={26} style={{ lineHeight: 31, letterSpacing: -0.52 }}>{a.title[lang]}</AppText>
      <AppText size={12} color={colors.muted}>{a.date[lang]} · {t('news.read', { min: read })}</AppText>
      <View style={{ gap: 6 }}>
        <NewsPhoto item={a} label={t('common.newsImage')} height={200} />
        {img && (
          <Tap onPress={() => img.page && Linking.openURL(img.page)} disabled={!img.page} hitSlop={6}>
            <AppText size={10} color={colors.muted} numberOfLines={1}>{t('detail.photoBy', { author: img.author, license: img.license })}</AppText>
          </Tap>
        )}
      </View>
      {a.body[lang].map((para, i) => (
        <AppText key={i} size={16} color={colors.body} style={{ lineHeight: 26 }}>{para}</AppText>
      ))}
      {a.source && (
        <Tap onPress={() => Linking.openURL(a.source!.url)} pressedBg={colors.card2} style={{ alignSelf: 'flex-start', paddingVertical: 4 }}>
          <AppText weight="bold" size={13} color={colors.lime}>{t('news.source', { name: a.source.name })} ↗</AppText>
        </Tap>
      )}
    </Page>
  );
}
