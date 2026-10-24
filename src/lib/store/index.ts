import "server-only";
import { LocalStore } from "./local-store";
import { SupabaseStore } from "./supabase-store";
import type { Store } from "./types";

export * from "./types";

let instance: Store | undefined;

export function supabaseConfig() {
  // The e2e suite creates and deletes content, so it must never reach a real database from .env.local.
  if (process.env.E2E_STORE === "1") return null;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && serviceKey ? { url, serviceKey, anonKey } : null;
}

/**
 * Supabase when its keys are present (Vercel Marketplace sets them), otherwise
 * a local JSON file for development. Callers never branch on the kind.
 */
export function getStore(): Store {
  if (!instance) {
    const config = supabaseConfig();
    instance = config ? new SupabaseStore(config.url, config.serviceKey) : new LocalStore();
  }
  return instance;
}
