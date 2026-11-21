/**
 * 現在のユーザーIDを返す、認証の入口（開発中はログインなし → 公開前にログインへ切替）。
 * データ層はユーザーIDを必ずここから取る。ログイン追加時はこのファイルの方針だけ変えればよい。
 */
import { getSupabase } from "@/lib/supabase/client";

export const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";

// supabase/dev/dev_open_access.sql が作る開発用ユーザーと同じID
const DEV_USER_ID =
  process.env.NEXT_PUBLIC_DEV_USER_ID ?? "00000000-0000-0000-0000-000000000001";

export async function getCurrentUserId(): Promise<string> {
  if (!AUTH_ENABLED) {
    // 誤公開の防止: 本番ビルドでログインなしのまま Supabase を操作させない
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "本番ではログインが必要です（ログイン機能を追加し、NEXT_PUBLIC_AUTH_ENABLED=true にしてください）",
      );
    }
    return DEV_USER_ID;
  }
  const { data, error } = await getSupabase().auth.getUser();
  if (error || !data.user) throw new Error("ログインが必要です");
  return data.user.id;
}
