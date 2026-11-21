"use client";

import { dismissError } from "@/lib/store";

/** 保存・読み込みの失敗を画面に出す */
export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
    >
      <p className="min-w-0 flex-1 break-words">{message}</p>
      <button
        type="button"
        onClick={dismissError}
        className="shrink-0 rounded px-2 text-red-700 hover:bg-red-100"
      >
        閉じる
      </button>
    </div>
  );
}
