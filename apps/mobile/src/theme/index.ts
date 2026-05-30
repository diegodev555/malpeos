// Mobile-optimized theme derived from @malpeos/shared theme tokens
// Converts oklch values to rgba for React Native StyleSheet compatibility

import { colors as sharedColors, spacing as sharedSpacing, borderRadius as sharedBorderRadius } from "@malpeos/shared";

// Helper to extract CSS variable names for the glass surface pattern
export const theme = {
  colors: {
    // Brand
    malpeosDark: "#0B3C64",
    malpeosLight: "#3CB4E5",

    // Background & Foreground
    background: "oklch(0.973 0.018 214)",
    foreground: "oklch(0.18 0.032 246)",

    // Surfaces
    card: "rgba(255, 255, 255, 0.66)",
    cardForeground: "oklch(0.18 0.032 246)",
    popover: "rgba(255, 255, 255, 0.76)",

    // Primary
    primary: "oklch(0.46 0.145 223)",
    primaryForeground: "oklch(0.985 0.015 210)",

    // Secondary
    secondary: "oklch(0.94 0.035 193 / 72%)",
    secondaryForeground: "oklch(0.25 0.063 222)",

    // Muted
    muted: "oklch(0.945 0.022 220 / 62%)",
    mutedForeground: "oklch(0.48 0.048 235)",

    // Accent
    accent: "oklch(0.91 0.06 181 / 72%)",
    accentForeground: "oklch(0.22 0.058 221)",

    // Semantic
    destructive: "oklch(0.577 0.245 27.325)",
    success: "#16A34A",
    warning: "#F59E0B",

    // Borders
    border: "rgba(255, 255, 255, 0.54)",
    input: "rgba(255, 255, 255, 0.58)",

    // Category colors (expense pie chart)
    categoryColors: {
      Fuel: "#f97316",
      Maintenance: "#a855f7",
      "Port Fees": "#0ea5e9",
      Wages: "#10b981",
      Ice: "#06b6d4",
      Other: "#6b7280",
    } as Record<string, string>,

    // Chart
    chart1: "oklch(0.64 0.16 174)",
    chart2: "oklch(0.69 0.18 55)",

    // Tab bar
    tabActive: "#0B3C64",
    tabInactive: "oklch(0.48 0.048 235)",
    tabBackground: "rgba(255, 255, 255, 0.85)",
  },

  spacing: sharedSpacing,
  borderRadius: sharedBorderRadius,

  fontSize: {
    xs: 12,
    sm: 13,
    base: 15,
    md: 14,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 28,
    "4xl": 34,
  },

  fontWeight: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
} as const;

export type Theme = typeof theme;