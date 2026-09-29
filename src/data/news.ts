import type { L10n } from '../i18n';
import type { NewsItem } from '../types';

export const NEWS_CATS: { id: string; label: L10n }[] = [
  { id: 'battery', label: { tr: 'Batarya', en: 'Battery' } },
  { id: 'charging', label: { tr: 'Şarj', en: 'Charging' } },
  { id: 'moto', label: { tr: 'Motosiklet', en: 'Motorcycle' } },
  { id: 'software', label: { tr: 'Yazılım', en: 'Software' } },
  { id: 'commercial', label: { tr: 'Ticari', en: 'Commercial' } },
];

export const NEWS: NewsItem[] = [
  {
    id: 'n1', cat: 'battery', readMin: 4, date: { tr: '28 Eyl', en: 'Sep 28' },
    title: { tr: 'Katı hal hücreleri pilot üretim hattına taşındı', en: 'Solid-state cells move to pilot production lines' },
    body: {
      tr: [
        'Birkaç üretici, katı hal batarya hücrelerini laboratuvar ölçeğinden pilot üretim hatlarına taşıdığını açıkladı. Hücrelerin aynı hacimde daha yüksek enerji yoğunluğu sunması bekleniyor.',
        'Seri üretim takvimi için verilen tarihler henüz netleşmedi; ilk uygulamaların üst segment otomobillerde görülmesi öngörülüyor.',
      ],
      en: [
        'Several manufacturers announced that they have moved solid-state battery cells from lab scale to pilot production lines. The cells are expected to offer higher energy density in the same volume.',
        'Dates for series production are not yet clear; the first applications are expected in premium cars.',
      ],
    },
  },
  {
    id: 'n2', cat: 'charging', readMin: 3, date: { tr: '26 Eyl', en: 'Sep 26' },
    title: { tr: 'Otoyol güzergâhlarında yüksek güçlü şarj noktaları çoğalıyor', en: 'High-power charging points multiply along highways' },
    body: {
      tr: [
        'Şarj ağı işletmecileri, şehirlerarası güzergâhlarda 150 kW ve üzeri istasyon sayısını artırmaya devam ediyor.',
        'Kullanıcılar için en önemli başlıklar istasyon doluluk bilgisinin anlık paylaşılması ve tek uygulamadan ödeme imkânı olarak öne çıkıyor.',
      ],
      en: [
        'Charging network operators keep increasing the number of stations rated 150 kW and above on intercity routes.',
        'The most important topics for users are real-time sharing of station occupancy and the ability to pay from a single app.',
      ],
    },
  },
  {
    id: 'n3', cat: 'moto', readMin: 5, date: { tr: '24 Eyl', en: 'Sep 24' },
    title: { tr: 'Değiştirilebilir batarya istasyonları kuryelerin gündeminde', en: 'Swappable battery stations are on couriers’ agenda' },
    body: {
      tr: [
        'Batarya değişim istasyonları, şarj için beklemek yerine dolu bir modülü birkaç saniyede takmaya imkân veriyor.',
        'Kurye filoları, bu modelin araç başına çalışma süresini artırabileceğini değerlendiriyor.',
      ],
      en: [
        'Battery swap stations let riders fit a full module in seconds instead of waiting to charge.',
        'Courier fleets believe this model could increase working time per vehicle.',
      ],
    },
  },
  {
    id: 'n4', cat: 'software', readMin: 3, date: { tr: '22 Eyl', en: 'Sep 22' },
    title: { tr: 'Uzaktan güncellemeyle menzil tahmini daha isabetli hale geliyor', en: 'Over-the-air updates make range estimates more accurate' },
    body: {
      tr: [
        'Yeni nesil araç yazılımları; hava durumu, eğim ve sürüş alışkanlığını birlikte hesaba katarak kalan menzili tahmin ediyor.',
        'Güncellemeler servis ziyareti gerektirmeden kablosuz olarak yükleniyor.',
      ],
      en: [
        'New-generation vehicle software estimates remaining range by taking weather, gradient and driving habits into account together.',
        'Updates are installed wirelessly without a service visit.',
      ],
    },
  },
  {
    id: 'n5', cat: 'commercial', readMin: 6, date: { tr: '19 Eyl', en: 'Sep 19' },
    title: { tr: 'Elektrikli kamyonetlerde yük ve menzil dengesi', en: 'Balancing payload and range in electric vans' },
    body: {
      tr: [
        'Hafif ticari araçlarda batarya kapasitesi arttıkça taşınabilecek yük miktarı azalabiliyor.',
        'Üreticiler hafif şasi malzemeleri ve verimli motorlarla bu dengeyi iyileştirmeye çalışıyor.',
      ],
      en: [
        'In light commercial vehicles, the payload that can be carried may decrease as battery capacity grows.',
        'Manufacturers are trying to improve this balance with lightweight chassis materials and efficient motors.',
      ],
    },
  },
];
