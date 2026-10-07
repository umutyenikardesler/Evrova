import type { L10n } from '../i18n';
import type { NewsItem } from '../types';

export const NEWS_CATS: { id: string; label: L10n }[] = [
  { id: 'battery', label: { tr: 'Batarya', en: 'Battery' } },
  { id: 'charging', label: { tr: 'Şarj', en: 'Charging' } },
  { id: 'moto', label: { tr: 'Motosiklet', en: 'Motorcycle' } },
  { id: 'software', label: { tr: 'Yazılım', en: 'Software' } },
  { id: 'commercial', label: { tr: 'Ticari', en: 'Commercial' } },
];

// Haberler kaynak sayfalardan özetlenmiş ve yeniden yazılmıştır. Görseller: assets/news/<kategori>/<yayın-tarihi>/ (scripts/fetch-news-images.mjs).
// Yeni haber eklerken: buraya kaydı, scripts/fetch-news-images.mjs içindeki PICKS'e görselini ekleyin, sonra `npm run seed`.
export const NEWS: NewsItem[] = [
  {
    id: 'n1', cat: 'software', readMin: 2, published: '2026-10-05', date: { tr: '5 Eki', en: 'Oct 5' },
    source: { name: 'CHIP Online', url: 'https://chip.com.tr/guncel/tesladan-superchargerlar-icin-acil-kacis-ozelligi_184360.html' },
    title: { tr: 'Tesla, şarj kablosu takılıyken hareket etmeyi sağlayan “acil durum sürüşü” özelliğini getirdi', en: 'Tesla adds an “emergency drive” mode that lets cars move while still plugged in' },
    body: {
      tr: [
        'Tesla, Supercharger istasyonlarında şarj kablosu araca bağlıyken bile hızla uzaklaşabilmeyi sağlayan “Acil durum sürüşü” özelliğini kullanıma sundu. Özellik tehlikeli bir durumda aracı hemen yola çıkarmak için tasarlandı.',
        'Araç hareket ettiğinde konnektör yuvasından kopuyor; bu da hem konnektöre hem de şarj girişine zarar verebiliyor. Tesla, sistemin kötüye kullanılması halinde yaptırım uygulanabileceğini belirtiyor. Özellik ilk etapta ABD pazarında devreye alındı.',
      ],
      en: [
        'Tesla has rolled out an “Emergency drive” feature that lets a car pull away from a Supercharger even while the charging cable is still connected. It is meant for situations where leaving immediately is a matter of safety.',
        'When the car moves, the connector breaks free from the port, which can damage both the connector and the charging inlet. Tesla warns that misuse of the feature may carry penalties. It launches in the US first.',
      ],
    },
  },
  {
    id: 'n2', cat: 'moto', readMin: 2, published: '2026-10-05', date: { tr: '5 Eki', en: 'Oct 5' },
    source: { name: 'Visordown', url: 'https://visordown.com/news/yamaha-ye-01-electric-dirt-bike-edges-closer-mxon-2026-debut-confirmed' },
    title: { tr: 'Yamaha’nın elektrikli motokros prototipi YE-01, Motocross of Nations’da sahneye çıkıyor', en: 'Yamaha’s YE-01 electric motocross prototype heads to the Motocross of Nations' },
    body: {
      tr: [
        'Yamaha, geçen yıl EICMA’da tanıttığı elektrikli motokros prototipi YE-01’i Fransa’nın Ernée kentindeki 2026 Motocross of Nations’da gösterecek. Model, Yamaha ile Fransız elektrikli motor uzmanı Electric Motion’ın ortak çalışması.',
        'YE-01’de Yamaha’nın YZ450F şasi tecrübesi, Electric Motion’ın elektrikli aktarma organlarıyla birleşiyor. Marka, ileride kurulması beklenen elektrikli motokros serisinde yarışmayı hedefliyor.',
      ],
      en: [
        'Yamaha will show the YE-01 electric motocross prototype, first revealed at EICMA last year, at the 2026 Motocross of Nations in Ernée, France. The bike is a joint effort with French electric specialist Electric Motion.',
        'The YE-01 combines Yamaha’s YZ450F chassis know-how with Electric Motion’s electric drivetrain. Yamaha is eyeing a place in an electric motocross racing series expected to launch in the near future.',
      ],
    },
  },
  {
    id: 'n3', cat: 'battery', readMin: 3, published: '2026-10-03', date: { tr: '3 Eki', en: 'Oct 3' },
    source: { name: 'ShiftDelete.Net', url: 'https://shiftdelete.net/gotion-high-tech-kati-hal-bataryasi-hedefi' },
    title: { tr: 'Gotion katı hal bataryada 400 Wh/kg hedefini açıkladı', en: 'Gotion sets a 400 Wh/kg target for solid-state batteries' },
    body: {
      tr: [
        'Çinli batarya üreticisi Gotion High-Tech, Jinshi katı hal hücrelerinde 400 Wh/kg enerji yoğunluğunu hedeflediğini duyurdu. Şirketin 2025’te devreye aldığı pilot hattın yıllık kapasitesi 0,2 GWh; 2 GWh’lik daha büyük bir tesisin tasarımı ise Mart 2026’da tamamlandı.',
        'Gotion’a göre küçük ölçekli üretim 2027’de başlayabilir, seri üretim ise 2030 civarını bulacak. Uzun vadeli maliyet hedefi yaklaşık 1 yuan/Wh (kabaca 150 dolar/kWh); bu, bugünkü LFP bataryaların hâlâ belirgin biçimde üzerinde. Şirket, Ağustos 2026 itibarıyla 4,61 GWh’lik kurulumla Çin pazarında beşinci sırada.',
      ],
      en: [
        'Chinese battery maker Gotion High-Tech says it is aiming for 400 Wh/kg in its Jinshi solid-state cells. Its pilot line, launched in 2025, has a 0.2 GWh annual capacity, and the design of a larger 2 GWh facility was completed in March 2026.',
        'According to Gotion, small-scale production could begin in 2027, with mass production around 2030. The long-term cost target is about 1 yuan/Wh (roughly $150/kWh), still well above today’s LFP batteries. As of August 2026 the company ranks fifth in China with 4.61 GWh installed.',
      ],
    },
  },
  {
    id: 'n4', cat: 'moto', readMin: 3, published: '2026-10-02', date: { tr: '2 Eki', en: 'Oct 2' },
    source: { name: 'New Atlas', url: 'https://newatlas.com/motorcycles/ultraviolette-usa-2027/' },
    title: { tr: 'Ultraviolette 85 milyon dolar yatırım aldı, 2027’de ABD’ye geliyor', en: 'Ultraviolette raises $85 million and heads to the US in 2027' },
    body: {
      tr: [
        'Hint elektrikli motosiklet üreticisi Ultraviolette, 85 milyon dolarlık yeni finansman sağladığını ve 2027’de ABD pazarına gireceğini açıkladı. Marka şimdiden 20 Avrupa ülkesinde satış yapıyor ve Hindistan’da yıllık 500 bine kadar motosiklet üretebilecek yeni bir fabrika kuruyor.',
        'Modeller arasında performans odaklı F77, radar tabanlı güvenlik sistemli X-47, yaklaşık 1.400 dolarlık Tesseract scooter ve 2027’nin ilk çeyreğinde gelecek elektrikli enduro Shockwave yer alıyor. Marka; batarya, aktarma organı ve yazılımı kendi bünyesinde geliştirdiğini vurguluyor.',
      ],
      en: [
        'Indian electric motorcycle maker Ultraviolette says it has secured $85 million in new funding and will enter the US market in 2027. It already sells in 20 European countries and is setting up a new Indian plant able to build up to 500,000 bikes a year.',
        'The lineup includes the performance-focused F77, the radar-equipped X-47, the Tesseract scooter at about $1,400 and the Shockwave electric enduro due in Q1 2027. The company stresses that it develops its battery, powertrain and software in-house.',
      ],
    },
  },
  {
    id: 'n5', cat: 'battery', readMin: 3, published: '2026-09-29', date: { tr: '29 Eyl', en: 'Sep 29' },
    source: { name: 'TGRT Haber', url: 'https://www.tgrthaber.com/otomobil/elektrikli-arac-bataryalari-tamamen-degisecek-tarih-belli-oldu-3362246' },
    title: { tr: 'Çin’in yeni batarya planı: katı hal bataryalar 2030’da ticari kullanıma', en: 'China’s new battery plan targets commercial solid-state use by 2030' },
    body: {
      tr: [
        'Çin Sanayi ve Bilgi Teknolojileri Bakanlığı, “Yeni Batarya Sanayii 15. Beş Yıllık Kalkınma Planı”nı yayımladı. Planın hedefi, katı hal bataryaların 2030’a kadar ticari kullanıma geçmesi; BYD, CATL ve GAC gibi firmalar için ilk araç testleri 2027–2028 arasında bekleniyor.',
        'Plan ayrıca batarya ömrünü 15.000 şarj döngüsüne çıkarmayı ve üretim hatalarını milyarda bire indirmeyi hedefliyor. Katı hal bataryalar şu an LFP’ye göre üç ila beş kat pahalı olduğundan Pekin, 1 Eylül 2026’dan itibaren geleneksel lityum bataryalara %2 tüketim vergisi getirdi (2027’de %4); sodyum-iyon ve katı hal bataryalar 2028’e kadar muaf.',
      ],
      en: [
        'China’s Ministry of Industry and Information Technology has published its “New Battery Industry 15th Five-Year Development Plan”. It targets commercial use of solid-state batteries by 2030, with first vehicle tests by companies such as BYD, CATL and GAC expected in 2027–2028.',
        'The plan also aims for a battery life of 15,000 charge cycles and manufacturing defects of one per billion. Since solid-state cells still cost three to five times as much as LFP, Beijing introduced a 2% consumption tax on conventional lithium batteries from 1 September 2026 (4% in 2027), while sodium-ion and solid-state batteries are exempt through 2028.',
      ],
    },
  },
  {
    id: 'n6', cat: 'software', readMin: 3, published: '2026-09-28', date: { tr: '28 Eyl', en: 'Sep 28' },
    source: { name: 'DonanımHaber', url: 'https://www.donanimhaber.com/ab-den-tesla-ya-kotu-haber-bir-kez-daha-ertelendi--210979' },
    title: { tr: 'AB’de Tesla FSD oylaması yine ertelendi: karar en erken Aralık’ta', en: 'EU vote on Tesla FSD postponed again: decision no earlier than December' },
    body: {
      tr: [
        'Avrupa Birliği’nde Tesla’nın “FSD Supervised” sürüş destek sistemine yönelik onay oylaması Ekim’den Aralık’a, en erken tarihe ertelendi. Motorlu Taşıtlar Teknik Komitesi, oylama maddesini 6 Ekim gündeminden çıkardı; toplantıda yalnızca 25 dakikalık bir görüşme yapılacak.',
        'AB genelinde onay için en az 15 üyenin ve AB nüfusunun %65’inin desteği gerekiyor. Hollanda, Belçika ve Danimarka dahil yedi ülke sistemi ulusal düzeyde onayladı; İsveç gibi bazı ülkeler ise güvenlik ve hız sınırlarına uyum konusunda çekincelerini sürdürüyor.',
      ],
      en: [
        'The EU vote on approving Tesla’s “FSD Supervised” driver-assistance system has been pushed from October to December at the earliest. The Motor Vehicles Technical Committee removed the vote from its 6 October agenda, leaving only a 25-minute discussion.',
        'EU-wide approval needs at least 15 member states representing 65% of the bloc’s population. Seven countries, including the Netherlands, Belgium and Denmark, have approved the system nationally, while others such as Sweden still have concerns about safety and speed-limit compliance.',
      ],
    },
  },
  {
    id: 'n7', cat: 'battery', readMin: 3, published: '2026-09-25', date: { tr: '25 Eyl', en: 'Sep 25' },
    source: { name: 'electrive', url: 'https://www.electrive.com/2026/09/25/mercedes-tests-new-gen4-battery-cells-from-prologium/' },
    title: { tr: 'Mercedes, ProLogium’un dördüncü nesil katı hal hücrelerini test edecek', en: 'Mercedes will test ProLogium’s fourth-generation solid-state cells' },
    body: {
      tr: [
        'Mercedes-Benz, Tayvanlı batarya geliştiricisi ProLogium ile ortaklığını genişleterek şirketin yeni Gen4 katı hal hücrelerini test edecek. Hücreler Mercedes’in kendi tesislerinde ve dış enstitülerde elektriksel, termal ve güvenlik testlerinden geçirilecek.',
        'ProLogium’un hücreleri yanmaz inorganik elektrolit ve seramik ayırıcı kullanıyor. İki şirketin işbirliği 2016’ya dayanıyor; Mercedes 2022’de ProLogium’a yatırım yapmıştı. ProLogium, Fransa’daki Dunkirk fabrikasını zamanla yıllık 44 GWh’e çıkarmayı planlıyor.',
      ],
      en: [
        'Mercedes-Benz is expanding its partnership with Taiwanese battery developer ProLogium to test the company’s new Gen4 solid-state cells. They will go through electrical, thermal and safety tests at Mercedes facilities and external institutes.',
        'ProLogium’s cells use a non-flammable inorganic electrolyte and a ceramic separator. The two companies have worked together since 2016, and Mercedes invested in ProLogium in 2022. ProLogium plans to grow its Dunkirk gigafactory in France to 44 GWh a year over time.',
      ],
    },
  },
  {
    id: 'n8', cat: 'charging', readMin: 3, published: '2026-09-25', date: { tr: '25 Eyl', en: 'Sep 25' },
    source: { name: 'Ticaret Gazetesi', url: 'https://ticaretgazetesi.com.tr/2026/09/25/elektrikli-arac-sarj-istasyonlarinda-yeni-donem-basliyor/' },
    title: { tr: 'EPDK, depolama destekli şarj istasyonlarının önünü açtı', en: 'Türkiye’s regulator clears the way for storage-backed charging stations' },
    body: {
      tr: [
        'Enerji Piyasası Düzenleme Kurumu (EPDK) yeni düzenlemeyle, elektrikli araç şarj istasyonlarındaki depolama sistemlerinin şebeke bağlantı anlaşmasındaki gücün üzerinde deşarj yapabilmesine izin verdi. Böylece birçok noktada pahalı şebeke altyapısı yatırımına gerek kalmayacak.',
        'Şart, sistemin şebekeye enerji vermesini otomatik olarak engelleyen bir kontrole sahip olması. Düzenlemenin özellikle talebin dalgalandığı otoyol ve ticari alanlardaki yüksek güçlü istasyonlara yarar sağlaması ve işletmecilerin yatırım maliyetini düşürmesi bekleniyor.',
      ],
      en: [
        'Türkiye’s Energy Market Regulatory Authority (EPDK) has ruled that storage systems at EV charging stations may discharge above the power in their grid connection agreement. In many locations this avoids costly grid upgrades.',
        'The condition is an automatic control that prevents energy from flowing back into the grid. The rule is expected to help high-power stations on highways and in commercial areas, where demand fluctuates, and to lower operators’ investment costs.',
      ],
    },
  },
  {
    id: 'n9', cat: 'charging', readMin: 3, published: '2026-09-24', date: { tr: '24 Eyl', en: 'Sep 24' },
    source: { name: 'electrive', url: 'https://www.electrive.com/2026/09/24/geely-counters-byd-with-2-25-mw-charging-system/' },
    title: { tr: 'Geely’den 2,25 MW şarj sistemi: %10’dan %70’e 4,5 dakika', en: 'Geely unveils a 2.25 MW charger: 10 to 70% in 4.5 minutes' },
    body: {
      tr: [
        'Geely, 2,25 MW gücündeki yeni şarj sistemini ve 12C şarj hızını destekleyen “Shendun Golden Battery” bataryasını tanıttı. Seçili Geely modelleri bu sistemle %10’dan %70’e yaklaşık 4,5 dakikada, %97’ye ise yaklaşık 8 dakika 40 saniyede şarj olabiliyor.',
        '“Xingrui PowerMind” adlı yapay zekâ sistemi sıcaklığı önceden tahmin ederek şarj gücünü ayarlıyor; ortalama hücre sıcaklığının 55 °C’nin altında tutulması hedefleniyor. Şirket, Çin’deki megavat seviyesi şarj rekabetinde BYD’nin karşılaştırılabilir sistemini az farkla geçtiğini söylüyor.',
      ],
      en: [
        'Geely has unveiled a 2.25 MW charging system together with its “Shendun Golden Battery”, which supports 12C charging. Selected Geely models can go from 10 to 70% in about 4.5 minutes and to 97% in roughly 8 minutes 40 seconds.',
        'An AI system called “Xingrui PowerMind” predicts temperature and adjusts charging power, aiming to keep average cell temperature below 55 °C. Geely says it slightly outpaces BYD’s comparable system in China’s megawatt-charging race.',
      ],
    },
  },
  {
    id: 'n10', cat: 'software', readMin: 2, published: '2026-09-22', date: { tr: '22 Eyl', en: 'Sep 22' },
    source: { name: 'GZT', url: 'https://www.gzt.com/teknoloji/tesla-fsd-icin-avrupada-yeni-onay-cekya-kamuya-acik-yollarda-tam-otonom-suruse-izin-verdi-4263209' },
    title: { tr: 'Çekya, Tesla FSD Supervised’a geçici onay verdi', en: 'Czech Republic grants provisional approval to Tesla FSD Supervised' },
    body: {
      tr: [
        'Çekya Ulaştırma Bakanlığı, Tesla’nın FSD Supervised sisteminin kamuya açık yollarda kullanılmasına geçici onay verdi. Çekya, sistemi onaylayan yedinci Avrupa ülkesi oldu.',
        'Tesla, yazılım güncellemesinin Çekya’daki kullanıcılara çok yakında kablosuz olarak gönderileceğini açıkladı. Sistem hukuken SAE Seviye 2 olarak sınıflandırılıyor; yani sürücü sorumlu olmaya ve dikkatini yolda tutmaya devam ediyor.',
      ],
      en: [
        'The Czech Transport Ministry has granted provisional approval for Tesla’s FSD Supervised system on public roads, making the Czech Republic the seventh European country to authorise it.',
        'Tesla said the software update will be sent over the air to Czech owners very soon. The system remains legally classified as SAE Level 2, so the driver stays responsible and must keep paying attention.',
      ],
    },
  },
  {
    id: 'n11', cat: 'charging', readMin: 3, published: '2026-09-21', date: { tr: '21 Eyl', en: 'Sep 21' },
    source: { name: 'DonanımHaber', url: 'https://www.donanimhaber.com/elektrikli-arac-sarj-islemleri-agustosta-3-5-milyonu-asti--210715' },
    title: { tr: 'Türkiye’de ağustosta 3,5 milyondan fazla şarj işlemi yapıldı', en: 'Türkiye logged more than 3.5 million charging sessions in August' },
    body: {
      tr: [
        'EPDK verilerine göre ağustosta 3 milyon 527 bin şarj işlemi yapıldı; Temmuz’daki 3 milyon 332 bine göre artış yaklaşık %5,9. Şarj istasyonlarında 97.469 MWh elektrik tüketildi ve işlem başına ortalama tüketim 27,6 kWh oldu.',
        'Şarj noktası sayısı 47.908’e çıktı: 20.864’ü DC hızlı, 27.044’ü AC. Elektrikli araç sayısı 476.934’e ulaşarak bir önceki yıla göre %53,5 arttı. Tüketimin yoğunlaştığı saat aralığı 16.00–19.00 oldu.',
      ],
      en: [
        'According to EPDK data, 3.527 million charging sessions took place in August, up about 5.9% from 3.332 million in July. Charging stations consumed 97,469 MWh, an average of 27.6 kWh per session.',
        'The number of charging points rose to 47,908, of which 20,864 are DC fast and 27,044 are AC. The EV fleet reached 476,934, up 53.5% year on year. Demand peaked between 4 and 7 pm.',
      ],
    },
  },
  {
    id: 'n12', cat: 'commercial', readMin: 3, published: '2026-09-21', date: { tr: '21 Eyl', en: 'Sep 21' },
    source: { name: 'Star', url: 'https://www.star.com.tr/ekonomi/turkiye-ticari-aracta-vites-yukseltti-elektrikli-modeller-avrupa-yolunda-haber-2041480/' },
    title: { tr: 'Türk üreticiler IAA’da elektrikli ticari araçlarla öne çıktı: Ford Trucks F-LINE E ihracata başladı', en: 'Turkish makers shine at IAA with electric commercial vehicles; Ford Trucks begins F-LINE E exports' },
    body: {
      tr: [
        'Almanya’nın Hannover kentindeki IAA Transportation 2026 fuarına 46 ülkeden 1.589 firma katıldı. 121 firmayla Türkiye, Çin’in ardından en kalabalık ikinci katılımcı oldu.',
        'Fuarda Mercedes-Benz’in tek şarjla 500 km menzil sunan eActros 600’ü de sergilendi. Ford Trucks ise Türkiye’de ürettiği tam elektrikli F-LINE E’nin Almanya ve Hollanda’ya ihracatına başladığını duyurdu.',
      ],
      en: [
        'The IAA Transportation 2026 fair in Hannover, Germany drew 1,589 companies from 46 countries. With 121 firms, Türkiye was the second-largest participant after China.',
        'The show also featured Mercedes-Benz’s eActros 600, rated at 500 km on one charge. Ford Trucks announced that it has started exporting its Türkiye-built, fully electric F-LINE E to Germany and the Netherlands.',
      ],
    },
  },
  {
    id: 'n13', cat: 'moto', readMin: 3, published: '2026-09-18', date: { tr: '18 Eyl', en: 'Sep 18' },
    source: { name: 'paultan.org', url: 'https://paultan.org/2026/09/18/royal-enfield-flying-flea-c6-e-bike-debuts-in-europe/' },
    title: { tr: 'Royal Enfield Flying Flea C6 Avrupa’da tanıtıldı: 5.990 avrodan başlıyor', en: 'Royal Enfield Flying Flea C6 debuts in Europe from €5,990' },
    body: {
      tr: [
        'Royal Enfield’ın elektrikli motosikleti Flying Flea C6, 16 Eylül’de Paris’te tanıtıldı. Fiyat Avrupa’da 5.990 avro, Birleşik Krallık’ta 5.300 sterlinden başlıyor; teslimatlar Ekim’de başlayacak. İlk etapta Paris, Barselona, Roma, Berlin ve Londra’da satılacak.',
        '3,91 kWh bataryalı C6, 15,4 kW (20,6 hp) güç ve 60 Nm tork üretiyor; azami hızı 115 km/s, Avrupa tipi WMTC menzili 104 km. %20’den %80’e yaklaşık 65 dakikada şarj oluyor. Dövme alüminyum şasi, kayış tahrik ve eğim duyarlı ABS gibi donanımlar sunuyor.',
      ],
      en: [
        'Royal Enfield’s electric Flying Flea C6 was unveiled in Paris on 16 September. It starts at €5,990 in Europe and £5,300 in the UK, with deliveries beginning in October. Initial sales cover Paris, Barcelona, Rome, Berlin and London.',
        'The C6 has a 3.91 kWh battery and produces 15.4 kW (20.6 hp) and 60 Nm. Top speed is 115 km/h, and WMTC range for European specification is 104 km. Charging from 20 to 80% takes about 65 minutes. It features a forged-aluminium frame, belt drive and lean-angle-sensitive ABS.',
      ],
    },
  },
  {
    id: 'n14', cat: 'commercial', readMin: 3, published: '2026-09-15', date: { tr: '15 Eyl', en: 'Sep 15' },
    source: { name: 'Habertürk', url: 'https://www.haberturk.com/ekonomi/avrupanin-ticari-arac-sinavi-elektrik-emisyon-ve-cin-rekabeti-iaa-transportation-2026-daki-tum-yenilikler-3912496' },
    title: { tr: 'IAA Transportation 2026: ticari araçlarda elektrik, emisyon ve Çin rekabeti', en: 'IAA Transportation 2026: electrification, emissions and Chinese competition' },
    body: {
      tr: [
        'Hannover’deki IAA Transportation 2026 fuarı, ticari araç sektörünün dönüşümünü gösterdi. Daimler Truck CEO’su, AB emisyon hedefleri tutturulamazsa yaklaşık 1,2 milyar avroluk cezayla karşılaşılabileceği uyarısında bulundu.',
        'Mercedes-Benz Türk, Ford Trucks ve BMC gibi Türk üreticiler elektrikli, hidrojen yakıt hücreli ve yapay zekâ destekli yeni nesil araçlarını sergiledi. Çinli rakipler de giderek daha iddialı ürünlerle sektörde rekabeti Avrupalı markaların ötesine taşıyor.',
      ],
      en: [
        'The IAA Transportation 2026 fair in Hannover showed how the commercial-vehicle industry is changing. Daimler Truck’s CEO warned that missing EU emission targets could mean fines of about €1.2 billion.',
        'Turkish makers such as Mercedes-Benz Türk, Ford Trucks and BMC displayed next-generation vehicles with electric and hydrogen fuel-cell powertrains and AI-assisted systems. Chinese competitors are also bringing increasingly strong products, widening the contest beyond European brands.',
      ],
    },
  },
  {
    id: 'n15', cat: 'commercial', readMin: 3, published: '2026-06-13', date: { tr: '13 Haz', en: 'Jun 13' },
    source: { name: 'Türkiye Gazetesi', url: 'https://www.turkiyegazetesi.com.tr/ekonomi/elektrikli-hafif-ticari-arac-satislari-25-katina-cikti-1796782' },
    title: { tr: 'Elektrikli hafif ticari satışları yılın ilk beş ayında %146 arttı', en: 'Electric light commercial vehicle sales rose 146% in the first five months' },
    body: {
      tr: [
        'Türkiye hafif ticari araç pazarında Ocak–Mayıs 2026’da elektrikli model satışları %146,1 artarak 1.174 adede çıktı (geçen yıl aynı dönemde 477). Yine de elektrikli araçlar toplam 96.882 adetlik pazarın yalnızca %1,2’sini oluşturuyor.',
        'Segmentin en çok satanı 605 adetle KG Mobility Musso EV oldu; onu 223 adetle Ford Custom izledi. Analistler, tercihlerdeki bu hızlı kaymanın önümüzdeki dönemde daha güçlü bir büyümeye işaret ettiğini belirtiyor.',
      ],
      en: [
        'In Türkiye’s light commercial vehicle market, electric sales rose 146.1% to 1,174 units in January–May 2026 (477 a year earlier). Even so, electric models are only 1.2% of the 96,882-unit market.',
        'The segment’s best seller was the KG Mobility Musso EV with 605 units, followed by the Ford Custom with 223. Analysts say the fast shift in preferences points to stronger growth ahead.',
      ],
    },
  },
];
