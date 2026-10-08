// data/news-items.json (tek kaynak) -> src/data/newsData.ts (uygulamanın kullandığı, otomatik üretilir).
//   node scripts/news-build.mjs
// Görsel eşlemesi ayrıca: node scripts/fetch-news-images.mjs (news-add.mjs ikisini de çalıştırır).
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const ITEMS = 'data/news-items.json';
const OUT = 'src/data/newsData.ts';
const CREDITS = 'assets/news/credits.json';
const MON_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const MON_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function buildNews() {
  const items = JSON.parse(readFileSync(ITEMS, 'utf8'));
  items.sort((a, b) => b.published.localeCompare(a.published) || a.id.localeCompare(b.id, 'en', { numeric: true }));
  const credits = existsSync(CREDITS) ? JSON.parse(readFileSync(CREDITS, 'utf8')) : {};
  const news = items.map(({ images, ...n }) => {
    const [, mm, dd] = n.published.split('-').map(Number);
    // Haberin kendi görseli (uzak): uygulama güncellenmeden de görünür; Commons'un 960 px küçük resmi.
    const c = credits[`assets/news/${n.cat}/${n.published}/${n.id}.jpg`];
    const photo = c ? { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(c.title.replace(/ /g, '_')) + '?width=960', author: c.author, license: c.license, page: c.page } : undefined;
    return { ...n, ...(photo ? { photo } : {}), date: { tr: `${dd} ${MON_TR[mm - 1]}`, en: `${MON_EN[mm - 1]} ${dd}` } };
  });
  writeFileSync(
    OUT,
    `// OTOMATİK ÜRETİLDİ: scripts/news-build.mjs (kaynak: data/news-items.json). Elle düzenleme.\n` +
      `import type { NewsItem } from '../types.ts';\n\n` +
      `export const NEWS_DATA: NewsItem[] = ${JSON.stringify(news, null, 2)};\n`,
  );
  return news.length;
}

if (process.argv[1]?.endsWith('news-build.mjs')) {
  console.log(`${OUT} üretildi (${buildNews()} haber).`);
}
