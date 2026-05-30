// Design tokens extracted from the existing web app's CSS variables and visual language
// These match: src/app/globals.css

export const colors = {
  // Brand
  malpeos: {
    dark: "#0B3C64",
    light: "#3CB4E5",
  },

  // Base surface
  background: "oklch(0.973 0.018 214)",      // Light blue-gray background
  foreground: "oklch(0.18 0.032 246)",        // Near-black text

  // Surfaces
  card: "oklch(1 0 0 / 66%)",
  cardForeground: "oklch(0.18 0.032 246)",
  popover: "oklch(1 0 0 / 76%)",
  popoverForeground: "oklch(0.18 0.032 246)",

  // Primary
  primary: "oklch(0.46 0.145 223)",           // Blue
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
  success: "oklch(0.6 0.18 145)",             // For positive values
  warning: "oklch(0.75 0.18 75)",

  // Borders & inputs
  border: "oklch(1 0 0 / 54%)",
  input: "oklch(1 0 0 / 58%)",
  ring: "oklch(0.66 0.138 207 / 55%)",

  // Chart colors
  chart: [
    "oklch(0.64 0.16 174)",   // Chart-1: Teal
    "oklch(0.69 0.18 55)",    // Chart-2: Orange
    "oklch(0.59 0.17 248)",   // Chart-3: Blue
    "oklch(0.66 0.16 330)",   // Chart-4: Pink
    "oklch(0.55 0.13 138)",   // Chart-5: Green
  ],

  // Category colors (for expense pie chart)
  categoryColors: {
    Fuel: "#f97316",
    Maintenance: "#a855f7",
    "Port Fees": "#0ea5e9",
    Wages: "#10b981",
    Ice: "#06b6d4",
    Other: "#6b7280",
  } as Record<string, string>,

  // Sidebar
  sidebar: "oklch(1 0 0 / 54%)",
  sidebarForeground: "oklch(0.18 0.032 246)",
  sidebarPrimary: "oklch(0.46 0.145 223)",
  sidebarPrimaryForeground: "oklch(0.985 0.015 210)",
  sidebarAccent: "oklch(0.92 0.05 190 / 62%)",
  sidebarAccentForeground: "oklch(0.2 0.055 224)",
  sidebarBorder: "oklch(1 0 0 / 52%)",
  sidebarRing: "oklch(0.66 0.138 207 / 55%)",
} as const;