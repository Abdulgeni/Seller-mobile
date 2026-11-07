import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { colorTokens, hapticFeedback, tokens } from "@repo/ui";
import { type AppearanceMode, useSettingsStore } from "../settings/settingsStore";

export type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
  theme: ResolvedTheme;
  isDark: boolean;
  appearanceMode: AppearanceMode;
  colors: typeof colorTokens.light | typeof colorTokens.dark;
  tokens: typeof tokens;
  setAppearanceMode: (mode: AppearanceMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  const systemColorScheme = useColorScheme();
  const appearanceMode = useSettingsStore((s) => s.appearanceMode);
  const setAppearanceMode = useSettingsStore((s) => s.setAppearanceMode);

  const theme: ResolvedTheme = useMemo(() => {
    if (appearanceMode === "dark") return "dark";
    if (appearanceMode === "light") return "light";
    return systemColorScheme === "dark" ? "dark" : "light";
  }, [appearanceMode, systemColorScheme]);

  const isDark = theme === "dark";
  const colors = colorTokens[theme];

  const toggleTheme = () => {
    hapticFeedback.buttonPress();
    const nextMode: AppearanceMode = isDark ? "light" : "dark";
    setAppearanceMode(nextMode);
  };

  const value: ThemeContextValue = useMemo(
    () => ({
      theme,
      isDark,
      appearanceMode,
      colors,
      tokens,
      setAppearanceMode,
      toggleTheme,
    }),
    [theme, isDark, appearanceMode, colors, setAppearanceMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Graceful fallback for tests or components rendered outside ThemeProvider
    return {
      theme: "light",
      isDark: false,
      appearanceMode: "light",
      colors: colorTokens.light,
      tokens,
      setAppearanceMode: () => {},
      toggleTheme: () => {},
    };
  }
  return ctx;
}
