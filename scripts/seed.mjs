// Araç / haber / bildirim verilerini Firestore'a yazar.
//   1) Firebase Console > Project settings > Service accounts > "Generate new private key"
//      -> dosyayı proje köküne serviceAccount.json olarak kaydet (git'e girmez)
//   2) npm i -D firebase-admin tsx   (bir kere)
//   3) npm run seed                  -> araç + haber + bildirim
//      node scripts/seed.mjs --vehicles-only   -> yalnızca araçlar (aylık fiyat güncellemesi için)
//      node scripts/seed.mjs --news-only       -> yalnızca haberler (36 saatte bir haber görevi için); yeni haber varsa
//                                                 en yenisi için 1 bildirim oluşturur (push'u Cloud Function gönderir)
import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { VEHICLES } from '../src/data/vehicles.ts';
import { NEWS } from '../src/data/news.ts';
import { localNotifications } from '../src/data/notifications.ts';

initializeApp({ credential: cert(JSON.parse(readFileSync('./serviceAccount.json', 'utf8'))) });
const db = getFirestore();
const vehiclesOnly = process.argv.includes('--vehicles-only');
const newsOnly = process.argv.includes('--news-only');
db.settings({ ignoreUndefinedProperties: true });

if (newsOnly) {
  const existing = new Set((await db.collection('news').get()).docs.map((d) => d.id));
  const fresh = NEWS.filter((n) => !existing.has(n.id));
  const keepNews = new Set(NEWS.map((n) => n.id));
  const b = db.batch();
  for (const { id, ...n } of NEWS) b.set(db.collection('news').doc(id), n);
  for (const id of existing) if (!keepNews.has(id)) b.delete(db.collection('news').doc(id)); // listeden çıkan (eski) haberler
  // En yeni haber için tek bildirim (ilk kurulumda toplu bildirim göndermemek için yalnızca birkaç haber yeniyse).
  const newest = [...fresh].sort((a, c) => c.published.localeCompare(a.published))[0];
  if (newest && fresh.length <= 6) {
    const cat = { battery: ['Batarya', 'Battery'], charging: ['Şarj', 'Charging'], moto: ['Motosiklet', 'Motorcycle'], software: ['Yazılım', 'Software'], commercial: ['Ticari', 'Commercial'] }[newest.cat];
    b.set(db.collection('notifications').doc('news-' + newest.id), {
      kind: 'news', createdAt: Date.now(), newsId: newest.id,
      title: { tr: 'Yeni haber: ' + cat[0], en: 'New story: ' + cat[1] },
      text: { tr: newest.title.tr, en: newest.title.en },
    });
  }
  await b.commit();
  console.log('Haberler yazıldı: ' + NEWS.length + ' (yeni: ' + fresh.length + (newest && fresh.length <= 6 ? ', bildirim: ' + newest.id : '') + ')');
  process.exit(0);
}

// Eski (örnek) araç belgelerini temizle
const keep = new Set(VEHICLES.map((v) => v.id));
for (const d of (await db.collection('vehicles').get()).docs) if (!keep.has(d.id)) await d.ref.delete();

const batch = db.batch();
for (const { id, ...v } of VEHICLES) batch.set(db.collection('vehicles').doc(id), v);
if (!vehiclesOnly) {
  for (const { id, ...n } of NEWS) batch.set(db.collection('news').doc(id), n);
  for (const { id, ...n } of localNotifications()) batch.set(db.collection('notifications').doc(id), n);
}
await batch.commit();
console.log(`Yazıldı: ${VEHICLES.length} araç, ${NEWS.length} haber, ${localNotifications().length} bildirim`);
