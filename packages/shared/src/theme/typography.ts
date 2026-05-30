// Typography design tokens matching the existing web app's styles
// Ref: src/app/globals.css — font stacks and heading sizes

export const fontFamily = {
  sans: '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  mono: '"SF Mono", "Cascadia Code", "Roboto Mono", ui-monospace, monospace',
  heading: '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
} as const;

export const fontSize = {
  xs: "0.75rem",        // 12px
  sm: "0.8125rem",      // 13px
  base: "0.9375rem",    // 15px (matches body text-[15px])
  md: "0.92rem",        // ~14.7px (input text)
  lg: "1.05rem",        // ~16.8px (card title)
  xl: "1.25rem",        // 20px
  "2xl": "1.7rem",      // ~27px (KPI values)
  "3xl": "2.15rem",     // ~34px (h1 mobile)
  "4xl": "2.5rem",      // 40px (h1 desktop)
} as const;

export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const lineHeight = {
  none: "1",
  tight: "1.05",
  snug: "1.15",
  normal: "1.5",
} as const;