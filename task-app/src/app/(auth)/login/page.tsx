import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "ログイン | タスク管理" };

export default function LoginPage() {
  // useSearchParams を使うフォームは Suspense で包む
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
