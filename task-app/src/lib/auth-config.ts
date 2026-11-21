/**
 * ログイン機能を有効にするかどうか（サーバー・クライアントどちらからも読める設定だけを置く）。
 * 開発中は false（ログイン画面を出さず、固定の開発用ユーザーで動く）。
 * 公開前に true にして、本番用の Supabase をつなぐ。
 */
export const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";

/** ログイン前でも開ける画面（これ以外はログインが必要） */
export const PUBLIC_PATHS = ["/login", "/signup", "/reset-password", "/auth"];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * ログイン後の移動先を安全な「サイト内のパス」だけに絞る（外部サイトへの誘導を防ぐ）。
 */
export function safeNextPath(next: string | null | undefined, fallback = "/tasks"): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
