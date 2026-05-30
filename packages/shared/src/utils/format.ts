// Shared formatting utilities — matches the web app's formatting patterns

import { CURRENCY_LOCALE, CURRENCY_CODE, CURRENCY_MAX_FRACTION } from "../constants";

/**
 * Format a number as INR currency (matching the web app's formatCurrency)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency: CURRENCY_CODE,
    maximumFractionDigits: CURRENCY_MAX_FRACTION,
  }).format(value);
}

/**
 * Format a date string to locale date
 */
export function formatDate(dateStr: string, locale = CURRENCY_LOCALE): string {
  return new Date(dateStr).toLocaleDateString(locale);
}

/**
 * Format month short label (e.g. "Jan 25")
 */
export function formatMonthLabel(date: Date): string {
  return date.toLocaleString(CURRENCY_LOCALE, {
    month: "short",
    year: "2-digit",
  });
}

/**
 * Get error message from unknown error
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    return String(err.message) || "Failed to load data";
  }
  return "Failed to load data";
}

/**
 * Round to 2 decimal places
 */
export function roundTo(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}