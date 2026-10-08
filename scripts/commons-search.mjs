// Wikimedia Commons'ta serbest lisanslı görsel arar (haber görseli seçimi için).
//   node scripts/commons-search.mjs "Tesla Supercharger" ["başka sorgu" ...]
// Çıktı: dosya adı, boyut, lisans, yazar. En az 1200 px genişlikteki JPEG'ler listelenir.
const UA = 'evrova-image-fetch/1.0 (umutyenikardesler@gmail.com)';
const strip = (h) => (h ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
for (const q of process.argv.slice(2)) {
  const u = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=15&gsrsearch='
    + encodeURIComponent(`${q} filetype:bitmap`) + '&prop=imageinfo&iiprop=size|extmetadata';
  const r = await (await fetch(u, { headers: { 'User-Agent': UA } })).json();
  console.log(`\n## ${q}`);
  const pages = Object.values(r.query?.pages ?? {}).sort((a, b) => a.index - b.index);
  let n = 0;
  for (const p of pages) {
    const i = p.imageinfo?.[0];
    if (!i || !/jpe?g$/i.test(p.title) || i.width < 1200) continue;
    n++;
    console.log(`${p.title.replace('File:', '')} | ${i.width}x${i.height} | ${i.extmetadata?.LicenseShortName?.value ?? '?'} | ${strip(i.extmetadata?.Artist?.value).slice(0, 40)}`);
  }
  if (!n) console.log('(uygun sonuç yok)');
  await new Promise((res) => setTimeout(res, 350));
}
