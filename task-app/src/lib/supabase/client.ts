import { createBrowserClient } from "@supabase/ssr";

// NEXT_PUBLIC_* はビルド時に埋め込まれるため、process.env.XXX と直接書く必要がある
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Supabase の接続情報が設定されているか。未設定ならモックのデータ層を使う */
export const isSupabaseConfigured = Boolean(url && anonKey);

let client: ReturnType<typeof createBrowserClient> | undefined;

export function getSupabase() {
  if (!url || !anonKey) {
    throw new Error("Supabase の接続情報（NEXT_PUBLIC_SUPABASE_URL / ANON_KEY）が未設定です");
  }
  client ??= createBrowserClient(url, anonKey);
  return client;
}
