// Araç / haber / bildirim verilerini Firestore'a yazar.
//   1) Firebase Console > Project settings > Service accounts > "Generate new private key"
//      -> dosyayı proje köküne serviceAccount.json olarak kaydet (git'e girmez)
//   2) npm i -D firebase-admin tsx   (bir kere)
//   3) npm run seed
import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { VEHICLES } from '../src/data/vehicles.ts';
import { NEWS } from '../src/data/news.ts';
import { localNotifications } from '../src/data/notifications.ts';

initializeApp({ credential: cert(JSON.parse(readFileSync('./serviceAccount.json', 'utf8'))) });
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

// Eski (örnek) araç belgelerini temizle
const keep = new Set(VEHICLES.map((v) => v.id));
for (const d of (await db.collection('vehicles').get()).docs) if (!keep.has(d.id)) await d.ref.delete();

const batch = db.batch();
for (const { id, ...v } of VEHICLES) batch.set(db.collection('vehicles').doc(id), v);
for (const { id, ...n } of NEWS) batch.set(db.collection('news').doc(id), n);
for (const { id, ...n } of localNotifications()) batch.set(db.collection('notifications').doc(id), n);
await batch.commit();
console.log(`Yazıldı: ${VEHICLES.length} araç, ${NEWS.length} haber, ${localNotifications().length} bildirim`);
