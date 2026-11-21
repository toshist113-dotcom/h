"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AUTH_ENABLED } from "@/lib/auth-config";
import { resetStore } from "@/lib/store";
import { getSupabase } from "@/lib/supabase/client";

const NAV = [
  { href: "/tasks", label: "タスク" },
  { href: "/labels", label: "ラベル" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await getSupabase().auth.signOut();
    resetStore();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4">
        <Link href="/tasks" className="text-lg font-bold text-indigo-700">
          タスク管理
        </Link>
        <nav aria-label="メインメニュー" className="flex gap-1">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {/* ログインが有効なときだけ表示（開発中は出さない） */}
        {AUTH_ENABLED && (
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="ml-auto rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {signingOut ? "ログアウト中…" : "ログアウト"}
          </button>
        )}
      </div>
    </header>
  );
}
