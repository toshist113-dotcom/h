"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field, FormError, AuthCard, authButton, authField } from "@/components/auth/auth-card";
import { MIN_PASSWORD_LENGTH, authErrorMessage, validatePassword } from "@/lib/auth-errors";
import { resetStore } from "@/lib/store";
import { getSupabase } from "@/lib/supabase/client";

/** メールのリンクから来た人が、新しいパスワードを決める画面 */
export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const message = validatePassword(password);
    if (message) return setError(message);
    if (password !== confirm) return setError("確認用のパスワードが一致しません。");

    setBusy(true);
    setError("");
    const { error: authError } = await getSupabase().auth.updateUser({ password });
    if (authError) {
      setBusy(false);
      return setError(authErrorMessage(authError));
    }
    resetStore();
    router.replace("/tasks");
    router.refresh();
  }

  return (
    <AuthCard title="新しいパスワード" description="新しいパスワードを入力してください。">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormError message={error} />
        <Field id="new-password" label="新しいパスワード" hint={`${MIN_PASSWORD_LENGTH}文字以上`}>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authField}
          />
        </Field>
        <Field id="new-password-confirm" label="新しいパスワード（確認）">
          <input
            id="new-password-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={authField}
          />
        </Field>
        <button type="submit" disabled={busy} className={authButton}>
          {busy ? "保存中…" : "パスワードを変更"}
        </button>
      </form>
    </AuthCard>
  );
}
