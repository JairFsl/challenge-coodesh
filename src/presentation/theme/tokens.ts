const palette = {
  indigo50: '#EEF0FF',
  indigo100: '#DDE1FF',
  indigo500: '#4F5BD5',
  indigo600: '#3F49B8',
  indigo300: '#9AA3F5',
  rose100: '#F3E1EA',
  rose900: '#3A2430',
  gray0: '#FFFFFF',
  gray50: '#F7F7FA',
  gray100: '#ECECF2',
  gray300: '#C9C9D6',
  gray500: '#7C7C90',
  gray700: '#3D3D4E',
  gray800: '#24242F',
  gray900: '#16161D',
  gray950: '#0E0E13',
  red500: '#D64545',
  red300: '#F08A8A',
  amber500: '#C98A12',
  amber300: '#F2C14E',
  green500: '#2E9D5B',
  green300: '#6FD49A',
};

export interface ColorTokens {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryMuted: string;
  onPrimary: string;
  highlight: string;
  danger: string;
  warning: string;
  success: string;
}

export const lightColors: ColorTokens = {
  background: palette.gray50,
  surface: palette.gray0,
  surfaceAlt: palette.gray100,
  border: palette.gray300,
  text: palette.gray900,
  textMuted: palette.gray500,
  primary: palette.indigo500,
  primaryMuted: palette.indigo100,
  onPrimary: palette.gray0,
  highlight: palette.rose100,
  danger: palette.red500,
  warning: palette.amber500,
  success: palette.green500,
};

export const darkColors: ColorTokens = {
  background: palette.gray950,
  surface: palette.gray900,
  surfaceAlt: palette.gray800,
  border: palette.gray700,
  text: palette.gray50,
  textMuted: palette.gray300,
  primary: palette.indigo300,
  primaryMuted: palette.indigo600,
  onPrimary: palette.gray950,
  highlight: palette.rose900,
  danger: palette.red300,
  warning: palette.amber300,
  success: palette.green300,
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 6, md: 10, lg: 16, full: 999 } as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700' },
  heading: { fontSize: 20, fontWeight: '700' },
  body: { fontSize: 16, fontWeight: '400' },
  label: { fontSize: 14, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: '400' },
} as const;

export interface Theme {
  dark: boolean;
  colors: ColorTokens;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
}

export const lightTheme: Theme = { dark: false, colors: lightColors, spacing, radius, typography };
export const darkTheme: Theme = { dark: true, colors: darkColors, spacing, radius, typography };
