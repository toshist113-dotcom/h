"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Field, FormError, FormNotice, AuthCard, authButton, authField } from "@/components/auth/auth-card";
import { authErrorMessage, validateEmail } from "@/lib/auth-errors";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export function ResetRequestForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const message = validateEmail(email);
    if (message) return setError(message);

    setBusy(true);
    setError("");
    const { error: authError } = await getSupabase().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });
    setBusy(false);
    if (authError) return setError(authErrorMessage(authError));
    // 登録の有無が分からないよう、結果は同じ文言にする
    setSent(true);
  }

  return (
    <AuthCard
      title="パスワードの再設定"
      description="登録したメールアドレスに、再設定用のリンクを送ります。"
      footer={
        <Link href="/login" className="text-indigo-700 hover:underline">
          ログインに戻る
        </Link>
      }
    >
      {!isSupabaseConfigured ? (
        <FormNotice message="Supabase の接続情報が未設定です。.env.local を確認してください。" />
      ) : sent ? (
        <FormNotice message="登録されているメールアドレスなら、再設定用のリンクを送りました。メールを確認してください。" />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormError message={error} />
          <Field id="reset-email" label="メールアドレス">
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authField}
            />
          </Field>
          <button type="submit" disabled={busy} className={authButton}>
            {busy ? "送信中…" : "再設定のメールを送る"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
