// app.json'daki ayarları temel alır; build profiline göre ad ve paket adını değiştirir.
//   eas.json > build.development.env.APP_VARIANT = "development"
//     -> "Evrova-Dev", com.tumurelsedrakiney.evrova.dev
//   diğer tüm build'ler (preview, production)
//     -> "Evrova",     com.tumurelsedrakiney.evrova
// İki sürüm aynı telefonda yan yana kurulabilir. google-services.json her iki paketi de içerir.
const isDev = process.env.APP_VARIANT === 'development';
const suffix = isDev ? '.dev' : '';

module.exports = ({ config }) => ({
  ...config,
  name: isDev ? 'Evrova-Dev' : 'Evrova',
  scheme: isDev ? 'evrova-dev' : 'evrova',
  ios: { ...config.ios, bundleIdentifier: `com.tumurelsedrakiney.evrova${suffix}` },
  android: {
    ...config.android,
    package: `com.tumurelsedrakiney.evrova${suffix}`,
    // EAS Build'de dosya, GOOGLE_SERVICES_JSON (file tipi) ortam değişkeninden gelir; yerelde kök dizindeki dosya kullanılır.
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
  },
});
