export const fonts = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
} as const;

export type Scheme = 'dark' | 'light';

const dark = {
  bg: '#101827',
  card: '#202C3D',
  card2: '#2A3950',
  lime: '#B9F227',
  limeSoft: 'rgba(185,242,39,0.14)',
  limeHover: '#ccff4d',
  ink: '#FFFFFF',
  muted: '#9AA4B2',
  line: 'rgba(255,255,255,0.08)',
  up: '#FF8A65',
  down: '#6EE09A',
  track: '#3a4a60',
  bar: '#34445c',
  body: '#dfe4ea',
  placeholder: '#7d8898',
  chartFill: 'rgba(185,242,39,0.12)',
};

export type Palette = typeof dark;

// Açık temada lime, beyaz zeminde okunabilsin diye daha koyu bir yeşil tona çekilir.
const light: Palette = {
  bg: '#F3F5F9',
  card: '#FFFFFF',
  card2: '#E8ECF3',
  lime: '#5A9400',
  limeSoft: 'rgba(90,148,0,0.12)',
  limeHover: '#4b7d00',
  ink: '#101827',
  muted: '#5B6675',
  line: 'rgba(16,24,39,0.10)',
  up: '#D9542B',
  down: '#1E9E58',
  track: '#C5CEDA',
  bar: '#CBD3DF',
  body: '#2B3442',
  placeholder: '#8A94A3',
  chartFill: 'rgba(90,148,0,0.14)',
};

export const palettes: Record<Scheme, Palette> = { dark, light };

/**
 * Geçerli renkler. Tema değişince ThemeProvider bu nesneyi yerinde günceller
 * ve uygulamayı yeniden çizer; bileşenler `colors.x` okumaya devam eder.
 */
export const colors: Palette = { ...dark };

export function applyScheme(scheme: Scheme) {
  Object.assign(colors, palettes[scheme]);
}
