const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

/** Expo Push API'sine (FCM/APNs'e iletir) toplu gönderim. */
async function sendPush(messages) {
  for (let i = 0; i < messages.length; i += 100) {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages.slice(i, i + 100)),
    });
    if (!res.ok) console.error('Expo push hatası', res.status, await res.text());
  }
}

const pick = (l10n, lang) => (l10n && (l10n[lang] || l10n.tr)) || '';

/** notifications/{id} eklenince: bildirimi açık olan herkese gönder. */
exports.onNotificationCreated = onDocumentCreated('notifications/{id}', async (event) => {
  const n = event.data.data();
  const users = await db.collection('users').where('notif', '==', true).get();
  const messages = [];
  users.forEach((u) => {
    const { expoPushToken, lang = 'tr' } = u.data();
    if (!expoPushToken) return;
    messages.push({
      to: expoPushToken,
      title: pick(n.title, lang),
      body: pick(n.text, lang),
      data: { kind: n.kind, newsId: n.newsId, vehicleId: n.vehicleId },
    });
  });
  await sendPush(messages);
});

/** vehicles/{id} fiyatı %2'den fazla değişirse, alarmı açık kullanıcılara bildir. */
exports.onVehiclePriceChanged = onDocumentUpdated('vehicles/{id}', async (event) => {
  const before = event.data.before.data().prices || [];
  const after = event.data.after.data();
  const prev = before[before.length - 1];
  const curr = (after.prices || [])[(after.prices || []).length - 1];
  if (!prev || !curr || prev === curr) return;
  const pct = ((curr - prev) / prev) * 100;
  if (Math.abs(pct) <= 2) return;

  const vehicleId = event.params.id;
  const users = await db.collection('users').where('notif', '==', true).get();
  const sign = pct > 0 ? '+' : '−';
  const value = Math.abs(pct).toFixed(1);
  const messages = [];
  users.forEach((u) => {
    const d = u.data();
    if (!d.expoPushToken || !d.alarms?.[vehicleId] || !(d.watch || []).includes(vehicleId)) return;
    const tr = (d.lang || 'tr') === 'tr';
    messages.push({
      to: d.expoPushToken,
      title: tr ? `${after.name} fiyatı ${pct > 0 ? 'arttı' : 'düştü'}` : `${after.name} price ${pct > 0 ? 'went up' : 'dropped'}`,
      body: tr ? `Fiyat ${sign}${value}% değişti.` : `The price changed by ${sign}${value}%.`,
      data: { kind: 'price', vehicleId },
    });
  });
  await sendPush(messages);
});
