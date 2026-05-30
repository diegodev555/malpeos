import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for conditionally joining classNames together, with Tailwind merge support.
 * This is the React Native compatible version (no DOM-specific classes).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}