"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field, FormError, FormNotice, AuthCard, authButton, authField } from "@/components/auth/auth-card";
import { authErrorMessage, validateEmail } from "@/lib/auth-errors";
import { resetStore } from "@/lib/store";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    params.get("error") === "link" ? "メールのリンクが無効か、期限が切れています。もう一度お試しください。" : "",
  );
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) return setError(emailError);
    if (!password) return setError("パスワードを入力してください。");

    setBusy(true);
    setError("");
    const { error: authError } = await getSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (authError) {
      setBusy(false);
      setError(authErrorMessage(authError));
      return;
    }
    resetStore(); // 前のユーザーのデータを残さない
    router.replace("/tasks");
    router.refresh();
  }

  return (
    <AuthCard
      title="ログイン"
      footer={
        <div className="flex flex-col gap-2">
          <Link href="/signup" className="text-indigo-700 hover:underline">
            はじめての方は、新規登録
          </Link>
          <Link href="/reset-password" className="text-indigo-700 hover:underline">
            パスワードを忘れた方
          </Link>
        </div>
      }
    >
      {!isSupabaseConfigured ? (
        <FormNotice message="Supabase の接続情報が未設定です。.env.local を確認してください。" />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormError message={error} />
          <Field id="login-email" label="メールアドレス">
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authField}
            />
          </Field>
          <Field id="login-password" label="パスワード">
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authField}
            />
          </Field>
          <button type="submit" disabled={busy} className={authButton}>
            {busy ? "ログイン中…" : "ログイン"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
