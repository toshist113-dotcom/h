/** Supabase Auth のエラーを、画面に出す日本語の文にする（英語の生のメッセージは出さない） */
export function authErrorMessage(error: { message?: string; code?: string } | null | undefined): string {
  const text = `${error?.code ?? ""} ${error?.message ?? ""}`.toLowerCase();

  if (text.includes("invalid login credentials") || text.includes("invalid_credentials")) {
    return "メールアドレスまたはパスワードが違います。";
  }
  if (text.includes("email not confirmed") || text.includes("email_not_confirmed")) {
    return "メールアドレスの確認が済んでいません。届いたメールのリンクを開いてください。";
  }
  if (text.includes("already registered") || text.includes("user_already_exists")) {
    return "このメールアドレスは、すでに登録されています。ログインしてください。";
  }
  if (text.includes("weak_password") || text.includes("password should be")) {
    return "パスワードが弱すぎます。8文字以上で、推測されにくいものにしてください。";
  }
  if (text.includes("same_password") || text.includes("different from the old")) {
    return "いまのパスワードと同じです。別のパスワードにしてください。";
  }
  if (text.includes("rate limit") || text.includes("over_email_send_rate_limit") || text.includes("too many")) {
    return "短い間に何度も試されました。しばらく待ってから、もう一度お試しください。";
  }
  if (text.includes("failed to fetch") || text.includes("network")) {
    return "通信に失敗しました。ネットワークを確認して、もう一度お試しください。";
  }
  if (text.includes("session") && text.includes("missing")) {
    return "ログインの有効期限が切れています。もう一度、最初からやり直してください。";
  }
  return "うまくいきませんでした。時間をおいて、もう一度お試しください。";
}

export const MIN_PASSWORD_LENGTH = 8;

/** 入力のチェック。問題があれば日本語のメッセージ、なければ空文字 */
export function validateEmail(email: string): string {
  const value = email.trim();
  if (!value) return "メールアドレスを入力してください。";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "メールアドレスの形式が正しくありません。";
  return "";
}

export function validatePassword(password: string): string {
  if (!password) return "パスワードを入力してください。";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `パスワードは${MIN_PASSWORD_LENGTH}文字以上にしてください。`;
  }
  return "";
}
