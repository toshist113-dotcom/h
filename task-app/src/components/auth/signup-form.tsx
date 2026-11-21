"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Field, FormError, FormNotice, AuthCard, authButton, authField } from "@/components/auth/auth-card";
import {
  MIN_PASSWORD_LENGTH,
  authErrorMessage,
  validateEmail,
  validatePassword,
} from "@/lib/auth-errors";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const message = validateEmail(email) || validatePassword(password);
    if (message) return setError(message);
    if (password !== confirm) return setError("確認用のパスワードが一致しません。");

    setBusy(true);
    setError("");
    const { error: authError } = await getSupabase().auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/tasks` },
    });
    setBusy(false);
    if (authError) return setError(authErrorMessage(authError));
    setSent(true);
  }

  return (
    <AuthCard
      title="新規登録"
      footer={
        <Link href="/login" className="text-indigo-700 hover:underline">
          登録済みの方は、ログイン
        </Link>
      }
    >
      {!isSupabaseConfigured ? (
        <FormNotice message="Supabase の接続情報が未設定です。.env.local を確認してください。" />
      ) : sent ? (
        <FormNotice message="確認メールを送りました。メールのリンクを開くと、登録が完了します。届かない場合は、迷惑メールのフォルダも確認してください。" />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormError message={error} />
          <Field id="signup-email" label="メールアドレス">
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authField}
            />
          </Field>
          <Field id="signup-password" label="パスワード" hint={`${MIN_PASSWORD_LENGTH}文字以上`}>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authField}
            />
          </Field>
          <Field id="signup-confirm" label="パスワード（確認）">
            <input
              id="signup-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={authField}
            />
          </Field>
          <button type="submit" disabled={busy} className={authButton}>
            {busy ? "送信中…" : "登録する"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
