import type { ImageSourcePropType } from 'react-native';
import { NEWS_CAT_IMAGES, NEWS_GALLERY } from '../data/newsImages';
import type { NewsItem } from '../types';

export interface NewsPhotoInfo { src: ImageSourcePropType; author: string; license: string; page: string }

/**
 * Haberin görseli: uygulamaya gömülü görsel (varsa) → haberin kendi uzak görseli (sonradan Firestore'a eklenen haberler,
 * uygulama güncellemesi gerektirmez) → kategori görseli.
 */
export function newsPhoto(n: Pick<NewsItem, 'id' | 'cat' | 'photo'>): NewsPhotoInfo | undefined {
  const bundled = NEWS_GALLERY[n.id]?.[0];
  if (bundled) return bundled;
  if (n.photo?.url) return { src: { uri: n.photo.url }, author: n.photo.author, license: n.photo.license, page: n.photo.page };
  return NEWS_CAT_IMAGES[n.cat];
}
