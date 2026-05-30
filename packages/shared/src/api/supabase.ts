/**
 * Shared Supabase client factory
 * Works on both web and React Native (with expo-secure-store or similar adapters)
 * Web uses environment variables, mobile uses the provided config
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

function isPlaceholder(value: string): boolean {
  return /your-|placeholder|example|anon-key|supabase-url/i.test(value);
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Initialize or retrieve the Supabase client.
 * On web, reads from environment variables.
 * On mobile, pass the config object with URL and anon key.
 */
export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl =
      config?.url ||
      (typeof process !== "undefined" &&
        (process.env.NEXT_PUBLIC_SUPABASE_URL ||
          process.env.EXPO_PUBLIC_SUPABASE_URL));
    const supabaseAnonKey =
      config?.anonKey ||
      (typeof process !== "undefined" &&
        (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY));

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for web, " +
          "or EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY for mobile."
      );
    }

    if (isPlaceholder(supabaseUrl as string) || isPlaceholder(supabaseAnonKey as string)) {
      throw new Error(
        "Supabase is still using placeholder credentials. Update your environment variables."
      );
    }

    supabaseInstance = createClient(supabaseUrl as string, supabaseAnonKey as string);
  }

  return supabaseInstance;
}

/**
 * Reset the client (useful for testing or config changes)
 */
export function resetSupabaseClient(): void {
  supabaseInstance = null;
}