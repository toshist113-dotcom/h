import { NextResponse, type NextRequest } from "next/server";
import { AUTH_ENABLED, isPublicPath } from "@/lib/auth-config";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * ログインが有効なときだけ働く。
 * - 未ログインで、ログイン不要でない画面を開いたら /login へ
 * - ログイン済みで /login /signup を開いたら /tasks へ
 * 開発中（NEXT_PUBLIC_AUTH_ENABLED が true でない）は何もしない。
 */
export async function proxy(request: NextRequest) {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  if (!AUTH_ENABLED || !configured) return NextResponse.next();

  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    const redirect = NextResponse.redirect(url);
    // 更新されたログイン情報（Cookie）を引き継ぐ
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  if (!user && !isPublicPath(pathname)) return redirectTo("/login");
  if (user && (pathname === "/login" || pathname === "/signup")) return redirectTo("/tasks");

  return response;
}

export const config = {
  // 静的ファイルや画像は対象外
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
