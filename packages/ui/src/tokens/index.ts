export const colorTokens = {
  light: {
    // Backgrounds & Canvas
    bgCanvas: "#F8F9FC",
    bgSurface: "#FFFFFF",
    bgRaised: "#F1F3F8",
    bgOverlay: "rgba(11, 14, 20, 0.45)",

    // Hairlines & Borders
    borderSubtle: "#E5E8F0",
    borderStrong: "#CBD2E1",
    borderFocus: "#059669",

    // Typography
    textPrimary: "#0B0E14",
    textSecondary: "#4B5565",
    textTertiary: "#8894A8",
    textInverse: "#FFFFFF",

    // Brand Accent (<= 5% screen budget)
    accent: "#059669",
    accentHover: "#047857",
    accentSubtle: "#ECFDF5",

    // Sovereign Highlight
    gold: "#D97706",
    goldSubtle: "#FEF3C7",

    // Status Signals
    positive: "#059669",
    positiveSubtle: "#ECFDF5",
    warning: "#D97706",
    warningSubtle: "#FFFBEB",
    critical: "#DC2626",
    criticalSubtle: "#FEF2F2",

    // Backward-Compatible Aliases for Phase 1 components
    background: "#F8F9FC",
    surface: "#FFFFFF",
    surfaceSubtle: "#F1F3F8",
    contentPrimary: "#0B0E14",
    contentSecondary: "#4B5565",
    contentMuted: "#8894A8",
    border: "#E5E8F0",
    borderFocusAlias: "#059669",
    primary: "#059669",
    primaryForeground: "#FFFFFF",
    success: "#059669",
    successForeground: "#FFFFFF",
    danger: "#DC2626",
    dangerForeground: "#FFFFFF",
    warningForeground: "#FFFFFF",

    // Monochromatic & Jewel Badges
    badgeNewBg: "#ECFDF5",
    badgeNewText: "#059669",
    badgeAcceptedBg: "#FEF3C7",
    badgeAcceptedText: "#92400E",
    badgePackedBg: "#F1F5F9",
    badgePackedText: "#334155",
    badgeShippedBg: "#F1F5F9",
    badgeShippedText: "#1E293B",
    badgeDeliveredBg: "#ECFDF5",
    badgeDeliveredText: "#047857",
    badgeCancelledBg: "#FEF2F2",
    badgeCancelledText: "#B91C1C",
  },
  dark: {
    // Backgrounds & Canvas
    bgCanvas: "#0A0D14",
    bgSurface: "#121622",
    bgRaised: "#1A2030",
    bgOverlay: "rgba(0, 0, 0, 0.75)",

    // Hairlines & Borders
    borderSubtle: "rgba(255, 255, 255, 0.08)",
    borderStrong: "rgba(255, 255, 255, 0.16)",
    borderFocus: "#10B981",

    // Typography
    textPrimary: "#F2F5FA",
    textSecondary: "#9BA5B7",
    textTertiary: "#5B667A",
    textInverse: "#0A0D14",

    // Brand Accent
    accent: "#10B981",
    accentHover: "#059669",
    accentSubtle: "rgba(16, 185, 129, 0.12)",

    // Sovereign Highlight
    gold: "#F59E0B",
    goldSubtle: "rgba(245, 158, 11, 0.14)",

    // Status Signals
    positive: "#10B981",
    positiveSubtle: "rgba(16, 185, 129, 0.12)",
    warning: "#F59E0B",
    warningSubtle: "rgba(245, 158, 11, 0.14)",
    critical: "#EF4444",
    criticalSubtle: "rgba(239, 68, 68, 0.14)",

    // Backward-Compatible Aliases for Phase 1 components
    background: "#0A0D14",
    surface: "#121622",
    surfaceSubtle: "#1A2030",
    contentPrimary: "#F2F5FA",
    contentSecondary: "#9BA5B7",
    contentMuted: "#5B667A",
    border: "rgba(255, 255, 255, 0.08)",
    borderFocusAlias: "#10B981",
    primary: "#10B981",
    primaryForeground: "#0A0D14",
    success: "#10B981",
    successForeground: "#0A0D14",
    danger: "#EF4444",
    dangerForeground: "#FFFFFF",
    warningForeground: "#0A0D14",

    // Monochromatic & Jewel Badges
    badgeNewBg: "rgba(16, 185, 129, 0.14)",
    badgeNewText: "#6EE7B7",
    badgeAcceptedBg: "rgba(245, 158, 11, 0.14)",
    badgeAcceptedText: "#FCD34D",
    badgePackedBg: "#1E293B",
    badgePackedText: "#CBD5E1",
    badgeShippedBg: "#1E293B",
    badgeShippedText: "#E2E8F0",
    badgeDeliveredBg: "rgba(16, 185, 129, 0.14)",
    badgeDeliveredText: "#6EE7B7",
    badgeCancelledBg: "rgba(239, 68, 68, 0.14)",
    badgeCancelledText: "#FCA5A5",
  },
} as const;

export const spacingTokens = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radiiTokens = {
  none: 0,
  sm: 6,      // Inner photo tiles, variant chips, toast notifications
  md: 10,     // Primary & secondary buttons, text input fields
  lg: 16,     // Standard cards, swipeable rows
  xl: 20,     // Hero containers
  sheet: 24,  // Bottom sheets
  full: 9999, // Status pills, round icon buttons
} as const;

export const typeScale = {
  displayHero: { fontSize: 34, lineHeight: 40, letterSpacing: -1.0, fontWeight: "700" as const },
  displayLg:   { fontSize: 28, lineHeight: 34, letterSpacing: -0.8, fontWeight: "700" as const },
  displayMd:   { fontSize: 22, lineHeight: 28, letterSpacing: -0.5, fontWeight: "600" as const },
  headline:    { fontSize: 18, lineHeight: 24, letterSpacing: -0.3, fontWeight: "600" as const },
  title:       { fontSize: 16, lineHeight: 22, letterSpacing: -0.2, fontWeight: "600" as const },
  bodyLg:      { fontSize: 15, lineHeight: 21, letterSpacing: -0.1, fontWeight: "400" as const },
  bodyMd:      { fontSize: 14, lineHeight: 20, letterSpacing: 0.0,  fontWeight: "400" as const },
  bodySm:      { fontSize: 13, lineHeight: 18, letterSpacing: 0.0,  fontWeight: "400" as const },
  caption:     { fontSize: 12, lineHeight: 16, letterSpacing: 0.1,  fontWeight: "500" as const },
  micro:       { fontSize: 10, lineHeight: 14, letterSpacing: 0.3,  fontWeight: "600" as const, textTransform: "uppercase" as const },
  numericLg:   { fontSize: 24, lineHeight: 30, letterSpacing: -0.5, fontWeight: "700" as const, fontVariant: ["tabular-nums" as const] },
  numericMd:   { fontSize: 16, lineHeight: 22, letterSpacing: -0.2, fontWeight: "600" as const, fontVariant: ["tabular-nums" as const] },
  numericSm:   { fontSize: 13, lineHeight: 18, letterSpacing: 0.0,  fontWeight: "600" as const, fontVariant: ["tabular-nums" as const] },
} as const;

export const motionTokens = {
  durations: {
    instant: 120,
    quick: 200,
    base: 320,
    dramatic: 480,
  },
  springs: {
    physical: { damping: 28, stiffness: 220, mass: 1 },
    press: { damping: 24, stiffness: 300, mass: 0.8 },
    pop: { damping: 20, stiffness: 260, mass: 0.9 },
  },
} as const;

export const elevationTokens = {
  light: {
    card: {
      shadowColor: "#0B0E14",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    raised: {
      shadowColor: "#0B0E14",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.06,
      shadowRadius: 20,
      elevation: 4,
    },
    modal: {
      shadowColor: "#0B0E14",
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.10,
      shadowRadius: 32,
      elevation: 8,
    },
  },
  dark: {
    card: {
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
      borderWidth: 0.5,
      borderColor: "rgba(255, 255, 255, 0.08)",
    },
    raised: {
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
      borderWidth: 0.5,
      borderColor: "rgba(255, 255, 255, 0.12)",
    },
    modal: {
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
      borderWidth: 0.5,
      borderColor: "rgba(255, 255, 255, 0.16)",
    },
  },
} as const;

export const tokens = {
  colors: colorTokens,
  spacing: spacingTokens,
  radii: radiiTokens,
  typography: typeScale,
  motion: motionTokens,
  elevation: elevationTokens,
  touchTarget: {
    minHeight: 44,
    minWidth: 44,
  },
} as const;

export type ThemeColors = typeof tokens.colors.light;
export type ColorTokens = typeof colorTokens;
export type SpacingTokens = typeof spacingTokens;
export type RadiiTokens = typeof radiiTokens;
export type TypeScale = typeof typeScale;
export type MotionTokens = typeof motionTokens;
