import React, { createContext, useContext, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';

import { darkTheme, lightTheme, type Theme } from './tokens';

const ThemeContext = createContext<Theme>(lightTheme);

/** Follows the system light/dark preference. */
export function ThemeProvider({ children }: PropsWithChildren) {
  const theme = useColorScheme() === 'dark' ? darkTheme : lightTheme;
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
