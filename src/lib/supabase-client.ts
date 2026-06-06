"use client";

import { getSupabasePublicConfig } from "@/lib/supabase-config";
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const config = getSupabasePublicConfig();
  if (!config) return null;
  return createBrowserClient(config.url, config.anonKey);
}
