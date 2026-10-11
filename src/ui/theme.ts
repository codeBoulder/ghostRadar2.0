// Єдина тема застосунку: кольори, шрифти, відступи.
// Принцип: холодний графіт, приглушений текст, ОДИН тьмяний акцент.
// Червоний — лише для статусу «не закрито» та помилок.

export const colors = {
  bg: '#0B0D0F',
  surface: '#101316',
  surfaceAlt: '#151A1E',
  border: '#222A30',
  borderStrong: '#34404A',
  text: '#D3D9DF',
  textDim: '#8B96A1',
  textFaint: '#58636D',
  accent: '#7FA88C',
  accentDim: '#2C4535',
  warn: '#B89A4E',
  danger: '#C0453F',
  dangerDim: '#3A1D1C',
  redaction: '#2B333A',
} as const;

export const fonts = {
  mono: 'JetBrainsMono_400Regular',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

export const radius = 3;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
