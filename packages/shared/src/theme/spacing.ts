// Spacing & sizing design tokens matching the web app's visual rhythm
// Ref: src/app/globals.css and component styles

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
} as const;

export const borderRadius = {
  sm: 6,       // calc(1rem * 0.6)
  md: 8,       // calc(1rem * 0.8)
  lg: 16,      // 1rem (base radius)
  xl: 22.4,    // calc(1rem * 1.4)
  "2xl": 28.8, // calc(1rem * 1.8)
  "3xl": 35.2, // calc(1rem * 2.2)
  "4xl": 41.6, // calc(1rem * 2.6)
  full: 9999,
} as const;

export const cardPadding = {
  default: { y: 16, x: 20 },
  sm: { y: 12, x: 16 },
} as const;