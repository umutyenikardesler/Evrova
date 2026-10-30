import type { Lang } from './index';

export type LegalDocId = 'terms' | 'privacy';
export interface LegalDoc {
  title: string;
  updated: string;
  intro: string;
  sections: { h: string; p: string[] }[];
}

/**
 * Yasal metinlerde gösterilen iletişim adresi. Boşsa iletişim bölümü ve başvuru cümleleri adressiz yazılır.
 *  */
export const CONTACT_EMAIL = 'info@evrova.com';

const contactTr = CONTACT_EMAIL ? `${CONTACT_EMAIL} adresine` : 'uygulama mağazası sayfasında yer alan iletişim bilgilerinden';
const contactEn = CONTACT_EMAIL ? `at ${CONTACT_EMAIL}` : 'using the contact details on the app store page';

const TR: Record<LegalDocId, LegalDoc> = {
  terms: {
    title: 'Kullanım Koşulları',
    updated: 'Son güncelleme: 30 Ekim 2026',
    intro: 'Evrova’yı kullanarak aşağıdaki koşulları kabul etmiş olursun. Lütfen kayıt olmadan önce dikkatle oku.',
    sections: [
      { h: '1. Hizmetin kapsamı', p: [
        'Evrova; elektrikli otomobil, motosiklet ve kamyonetlerin aylık fiyatlarını takip etmeni, fiyat değişimi alarmı kurmanı, elektrikli mobilite haberlerini okumanı, ÖTV/MTV bilgilerine ve vergi hesaplayıcıya ulaşmanı ve yakınındaki şarj noktalarını listelemeni sağlayan bir mobil uygulamadır.',
      ] },
      { h: '2. Bilgilendirme amaçlıdır', p: [
        'Uygulamadaki fiyatlar, markaların resmi sitelerinden ve fiyat listelerinden derlenir; kampanyalar, bayi farkları ve güncelleme gecikmeleri nedeniyle gerçek satış fiyatından farklı olabilir. Satın alma kararından önce fiyatı mutlaka yetkili satıcıdan doğrulamalısın.',
        'Vergi hesaplayıcının sonuçları tahminidir ve resmi bir hesaplama yerine geçmez; kesin değerler için Gelir İdaresi Başkanlığı ve ilgili kurumların güncel mevzuatına bakmalısın.',
        'Şarj noktaları listesi açık kaynaklı harita verisine (OpenStreetMap) dayanır, eksik veya güncel olmayabilir. İstasyonun çalıştığı, müsait olduğu veya belirtilen ücretin geçerli olduğu garanti edilmez; gitmeden önce işletmecinin uygulamasından kontrol etmelisin.',
        'Uygulamadaki hiçbir içerik yatırım, finansal veya satın alma tavsiyesi değildir.',
      ] },
      { h: '3. Hesap ve güvenlik', p: [
        'Kayıt olurken doğru ve güncel bilgi vermeyi, hesabının güvenliğinden sorumlu olduğunu kabul edersin. Apple veya Google ile giriş yaptığında ilgili hesabın güvenliği de senin sorumluluğundadır.',
        'Ad, soyad, e-posta ve şifreni Profil sayfasından değiştirebilirsin. E-posta değişikliği, yeni adrese gönderilen doğrulama bağlantısına dokunduğunda geçerli olur. Apple veya Google ile açtığın hesaba istersen bir şifre ekleyip e-postanla da giriş yapabilirsin.',
        'Hesabında izinsiz bir kullanım fark edersen bunu bize bildirmelisin.',
      ] },
      { h: '4. Kabul edilebilir kullanım', p: [
        'Uygulamayı yalnızca yasal amaçlarla ve kişisel olarak kullanabilirsin. Şunları yapmamayı kabul edersin: uygulamanın ya da sunucularının işleyişini aksatmak, otomatik araçlarla toplu veri çekmek, uygulamayı tersine mühendislikle çözmeye çalışmak, başkalarının hesabına erişmeye çalışmak, içeriği izinsiz ticari amaçla çoğaltmak veya dağıtmak.',
      ] },
      { h: '5. Fikri mülkiyet ve kaynaklar', p: [
        'Uygulamanın tasarımı, yazılımı ve özgün içerikleri Evrova’ya aittir. Haberler, kaynak sayfalardan özetlenip yeniden yazılmıştır ve kaynağına bağlantı verir; haber kaynaklarının hakları kendilerine aittir.',
        'Araç ve haber fotoğrafları çoğunlukla Wikimedia Commons’tan serbest lisanslı olarak kullanılır; yazar ve lisans bilgisi fotoğrafların altında yer alır. Harita verisi © OpenStreetMap katkıcılarına aittir ve Açık Veri Tabanı Lisansı (ODbL) ile sunulur. Marka adları ve logoları ilgili sahiplerine aittir.',
      ] },
      { h: '6. Bildirimler', p: [
        'Fiyat alarmı açtığında, takip ettiğin aracın fiyatı belirgin biçimde değiştiğinde (%2’den fazla) sana bildirim gönderebiliriz. Bildirimleri uygulama içindeki ayarlardan veya cihazının ayarlarından istediğin zaman kapatabilirsin.',
      ] },
      { h: '7. Sorumluluğun sınırı', p: [
        'Uygulama “olduğu gibi” sunulur. Kesintisiz veya hatasız çalışacağı, içeriğin tam ve güncel olacağı garanti edilmez. Yasaların izin verdiği ölçüde, uygulamadaki bilgilere dayanarak aldığın kararlardan doğan zararlardan Evrova sorumlu tutulamaz.',
      ] },
      { h: '8. Değişiklikler ve sona erme', p: [
        'Hizmeti ve bu koşulları güncelleyebiliriz; önemli değişiklikleri uygulama içinde duyururuz. Değişiklikten sonra uygulamayı kullanmaya devam etmen güncel koşulları kabul ettiğin anlamına gelir. Koşullara aykırı kullanımda hesabını kısıtlama veya kapatma hakkımız saklıdır.',
        'Hesabını istediğin zaman Profil sayfasındaki “Hesabı sil” butonuyla kalıcı olarak silebilirsin; silinen hesap ve veriler geri getirilemez.',
      ] },
      { h: '9. Uygulanacak hukuk', p: [
        'Bu koşullara Türkiye Cumhuriyeti hukuku uygulanır; uyuşmazlıklarda Türkiye’deki yetkili mahkemeler ve icra daireleri yetkilidir. Tüketici olarak kanundan doğan haklarını kullanma imkânın saklıdır.',
      ] },
      ...(CONTACT_EMAIL ? [{ h: '10. İletişim', p: [`Sorularını ${CONTACT_EMAIL} adresine iletebilirsin.`] }] : []),
    ],
  },
  privacy: {
    title: 'Gizlilik Politikası',
    updated: 'Son güncelleme: 30 Ekim 2026',
    intro: 'Bu politika, Evrova’yı kullanırken hangi kişisel verilerini neden işlediğimizi, kimlerle paylaştığımızı ve haklarını 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında açıklar. Veri sorumlusu, Evrova uygulamasının geliştiricisidir.',
    sections: [
      { h: '1. Hangi verileri işliyoruz?', p: [
        'Hesap bilgileri: ad, soyad ve e-posta adresin. Apple veya Google ile giriş yaptığında bu sağlayıcılar adını ve e-postanı (Apple’da gizli e-posta seçeneğini kullanabilirsin) bize iletir. Şifreni biz görmeyiz; kimlik doğrulama Google Firebase Authentication ile yapılır ve şifren orada özetlenmiş (hash) biçimde saklanır. Apple veya Google ile açtığın hesaba şifre eklersen hesabına e-posta ve şifre giriş yöntemi de bağlanır. E-postanı değiştirdiğinde yeni adrese bir doğrulama e-postası, şifreni unuttuğunda bir sıfırlama e-postası gönderilir; bu e-postalar Firebase üzerinden iletilir.',
        'Uygulama tercihlerin: takip ettiğin araçlar, kurduğun fiyat alarmları, okuduğun bildirimler, bildirim tercihi, dil, para birimi ve görünüm ayarın.',
        'Cihaz bildirim kodları: bildirim gönderebilmemiz için Expo bildirim kodu ile Apple (APNs) veya Google (FCM) cihaz kodu.',
        'Konum: yalnızca Şarj noktaları sayfasında “Konumumu kullan” dediğinde ve izin verirsen, cihazının anlık konumu kullanılır. Bu konum, yakındaki istasyonları sıralamak ve bulunduğun il/ilçeyi göstermek için cihazında işlenir; sunucularımıza kaydedilmez. İl/ilçe adı cihazının işletim sisteminin (Apple veya Google) adres servisinden alınır.',
      ] },
      { h: '2. Hangi amaçlarla kullanıyoruz?', p: [
        'Hesabını oluşturmak ve giriş yapmanı sağlamak; takip listeni ve tercihlerini cihazlarında senkronize etmek; fiyat alarmı ve duyuru bildirimlerini göndermek; yakındaki şarj noktalarını göstermek; hizmetin güvenliğini sağlamak ve yasal yükümlülüklerimizi yerine getirmek.',
        'Uygulamada reklam veya üçüncü taraf analitik/izleme aracı kullanmıyoruz ve verilerini pazarlama amacıyla satmıyoruz.',
      ] },
      { h: '3. Hukuki sebepler', p: [
        'Verilerini; hesap sözleşmesinin kurulması ve ifası, hukuki yükümlülüklerimizin yerine getirilmesi, temel hak ve özgürlüklerine zarar vermemek kaydıyla meşru menfaatimiz ve konum ile bildirim gibi özellikler için açık rızan (cihaz iznin) dayanaklarıyla işleriz. İzni istediğin zaman cihaz ayarlarından geri çekebilirsin.',
      ] },
      { h: '4. Verilerini kimlerle paylaşıyoruz?', p: [
        'Verilerin; hizmeti çalıştırmamız için kullandığımız altyapı sağlayıcılarıyla paylaşılır: Google (Firebase Authentication ve Firestore veri tabanı, doğrulama ve şifre sıfırlama e-postaları, Google ile giriş ve Android bildirimleri), Apple (Apple ile giriş ve iOS bildirimleri) ve Expo (bildirim iletim servisi). Bu sağlayıcılar yurt dışında bulunabilir; bu nedenle verilerin yurt dışına aktarılabilir. Aktarımı, KVKK’nın yurt dışına aktarıma ilişkin hükümlerine uygun olarak yaparız.',
        'Yasal bir yükümlülük gerektirmedikçe verilerini başka üçüncü kişilerle paylaşmayız.',
      ] },
      { h: '5. Ne kadar süre saklıyoruz?', p: [
        'Hesap ve tercih verilerini hesabın açık olduğu sürece saklarız. Hesabını Profil sayfasındaki “Hesabı sil” butonuyla istediğin zaman silebilirsin. Bu durumda Firestore’daki profil belgen (tercihlerin, takip listen, alarmların ve cihaz bildirim kodların) ile Firebase Authentication’daki hesap kaydın kalıcı olarak silinir; Apple ile giriş yaptıysan Apple’daki yetkilendirmen de iptal edilir. Silinen veriler geri getirilemez. Yasal saklama yükümlülüklerimiz saklıdır.',
      ] },
      { h: '6. Verilerini nasıl koruyoruz?', p: [
        'Veriler şifreli bağlantılarla iletilir. Veri tabanı kurallarımız, her kullanıcının yalnızca kendi profil verisine erişmesine izin verecek şekilde yapılandırılmıştır. Hiçbir sistemin tamamen güvenli olmadığını, bu nedenle mutlak güvenlik garanti edemediğimizi hatırlatırız.',
      ] },
      { h: '7. Haklarını nasıl kullanırsın?', p: [
        `KVKK’nın 11. maddesi uyarınca; verilerinin işlenip işlenmediğini öğrenme, işlenmişse bilgi isteme, amacına uygun kullanılıp kullanılmadığını öğrenme, aktarıldığı kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini isteme ve işlemeye itiraz etme haklarına sahipsin. Ad, e-posta ve şifreni Profil sayfasından kendin düzeltebilir, hesabını “Hesabı sil” butonuyla kendin silebilirsin. Diğer taleplerini ${contactTr} iletebilirsin; en geç 30 gün içinde yanıtlarız.`,
      ] },
      { h: '8. Çocuklar', p: [
        'Evrova çocuklara yönelik değildir. Bir çocuğa ait veri topladığımızı fark edersek bu veriyi sileriz.',
      ] },
      { h: '9. Değişiklikler', p: [
        'Bu politikayı güncelleyebiliriz. Önemli değişiklikleri uygulama içinde duyururuz; güncel metin her zaman bu ekranda yer alır.',
      ] },
    ],
  },
};

const EN: Record<LegalDocId, LegalDoc> = {
  terms: {
    title: 'Terms of Use',
    updated: 'Last updated: October 30, 2026',
    intro: 'By using Evrova you agree to the terms below. Please read them carefully before you sign up.',
    sections: [
      { h: '1. What the service is', p: [
        'Evrova is a mobile app that lets you track monthly prices of electric cars, motorcycles and vans, set price-change alerts, read electric mobility news, see Turkish ÖTV/MTV tax information and a tax calculator, and list nearby charging points.',
      ] },
      { h: '2. For information only', p: [
        'Prices in the app are compiled from brands’ official websites and price lists. They may differ from the actual selling price because of promotions, dealer differences and update delays. Always confirm the price with an authorised seller before buying.',
        'Tax calculator results are estimates and do not replace an official calculation. Check current legislation and the relevant authorities for exact figures.',
        'The charging points list is based on open map data (OpenStreetMap) and may be incomplete or out of date. We do not guarantee that a station is working, available or that the stated fee is valid; check the operator’s app before you go.',
        'Nothing in the app is investment, financial or purchase advice.',
      ] },
      { h: '3. Your account and security', p: [
        'You agree to give accurate and current information when you sign up and to keep your account secure. When you sign in with Apple or Google, you are also responsible for the security of that account.',
        'You can change your first name, last name, email and password on the Profile page. An email change takes effect when you tap the verification link sent to the new address. If you opened your account with Apple or Google, you can add a password and also sign in with your email.',
        'If you notice unauthorised use of your account, you must tell us.',
      ] },
      { h: '4. Acceptable use', p: [
        'You may use the app only lawfully and for personal use. You agree not to: disrupt the app or its servers, collect data in bulk with automated tools, reverse engineer the app, try to access other people’s accounts, or copy or distribute content commercially without permission.',
      ] },
      { h: '5. Intellectual property and sources', p: [
        'The app’s design, software and original content belong to Evrova. News items are summarised and rewritten from source pages and link back to them; the news sources keep their own rights.',
        'Vehicle and news photos are mostly used from Wikimedia Commons under free licences; author and licence details appear under the photos. Map data is © OpenStreetMap contributors and available under the Open Database Licence (ODbL). Brand names and logos belong to their owners.',
      ] },
      { h: '6. Notifications', p: [
        'If you turn on a price alert, we may send you a notification when the price of a vehicle you follow changes significantly (more than 2%). You can turn notifications off at any time in the app or in your device settings.',
      ] },
      { h: '7. Limit of liability', p: [
        'The app is provided “as is”. We do not guarantee that it will run without interruption or errors, or that content will be complete and up to date. To the extent the law allows, Evrova is not liable for losses from decisions you make based on information in the app.',
      ] },
      { h: '8. Changes and termination', p: [
        'We may update the service and these terms and will announce important changes in the app. Continuing to use the app after a change means you accept the updated terms. We may restrict or close accounts that break these terms.',
        'You can permanently delete your account at any time with the “Delete account” button on the Profile page; a deleted account and its data cannot be restored.',
      ] },
      { h: '9. Governing law', p: [
        'These terms are governed by the laws of the Republic of Türkiye, and the competent courts and enforcement offices in Türkiye have jurisdiction. Your statutory rights as a consumer are not affected.',
      ] },
      ...(CONTACT_EMAIL ? [{ h: '10. Contact', p: [`You can send questions to ${CONTACT_EMAIL}.`] }] : []),
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'Last updated: October 30, 2026',
    intro: 'This policy explains what personal data we process when you use Evrova and why, who we share it with, and your rights under the Turkish Personal Data Protection Law (KVKK, Law No. 6698). The data controller is the developer of the Evrova app.',
    sections: [
      { h: '1. What data we process', p: [
        'Account details: your first name, last name and email address. If you sign in with Apple or Google, those providers send us your name and email (with Apple you can choose to hide your email). We never see your password; sign-in is handled by Google Firebase Authentication, where your password is stored in hashed form. If you add a password to an account you opened with Apple or Google, an email and password sign-in method is also linked to your account. When you change your email we send a verification email to the new address, and when you forget your password a reset email; these emails are delivered through Firebase.',
        'Your app preferences: the vehicles you follow, the price alerts you set, the notifications you have read, your notification preference, language, currency and appearance setting.',
        'Device notification codes: an Expo push token and an Apple (APNs) or Google (FCM) device token so we can send you notifications.',
        'Location: only when you tap “Use my location” on the Charging points page and allow it, your device’s current location is used. It is processed on your device to sort nearby stations and show your province/district, and it is not stored on our servers. The place name comes from your device operating system’s (Apple or Google) address service.',
      ] },
      { h: '2. Why we use it', p: [
        'To create your account and let you sign in; to sync your watchlist and preferences; to send price alerts and announcements; to show nearby charging points; to keep the service secure and to meet our legal obligations.',
        'The app does not use advertising or third-party analytics/tracking tools, and we do not sell your data for marketing.',
      ] },
      { h: '3. Legal bases', p: [
        'We process your data to set up and perform the account agreement, to meet legal obligations, for our legitimate interests (as long as they do not harm your fundamental rights) and, for features such as location and notifications, on your explicit consent (your device permission). You can withdraw a permission at any time in your device settings.',
      ] },
      { h: '4. Who we share it with', p: [
        'Your data is shared with infrastructure providers we use to run the service: Google (Firebase Authentication and the Firestore database, verification and password reset emails, Google sign-in and Android notifications), Apple (Apple sign-in and iOS notifications) and Expo (notification delivery service). These providers may be located outside Türkiye, so your data may be transferred abroad. We do this in line with the KVKK provisions on international transfers.',
        'We do not share your data with other third parties unless the law requires it.',
      ] },
      { h: '5. How long we keep it', p: [
        'We keep account and preference data while your account is open. You can delete your account at any time with the “Delete account” button on the Profile page. Your profile document in Firestore (your preferences, watchlist, alerts and device notification codes) and your account record in Firebase Authentication are then permanently deleted; if you signed in with Apple, your Apple authorisation is also revoked. Deleted data cannot be restored. Our legal retention duties remain reserved.',
      ] },
      { h: '6. How we protect it', p: [
        'Data is sent over encrypted connections. Our database rules only let each user access their own profile data. No system is completely secure, so we cannot guarantee absolute security.',
      ] },
      { h: '7. Your rights', p: [
        `Under Article 11 of the KVKK you may: learn whether your data is processed, request information about it, learn its purpose and whether it is used accordingly, know who it is transferred to, ask for correction of incomplete or wrong data, ask for deletion or destruction, and object to processing. You can correct your name, email and password yourself on the Profile page and delete your account yourself with the “Delete account” button. You can send your other requests ${contactEn}; we reply within 30 days at the latest.`,
      ] },
      { h: '8. Children', p: [
        'Evrova is not directed at children. If we find out that we collected a child’s data, we will delete it.',
      ] },
      { h: '9. Changes', p: [
        'We may update this policy. We will announce important changes in the app, and the current text is always available on this screen.',
      ] },
    ],
  },
};

export const legalDoc = (lang: Lang, id: LegalDocId): LegalDoc => (lang === 'en' ? EN : TR)[id];
