import { redirect } from "next/navigation";
import { AUTH_ENABLED } from "@/lib/auth-config";

/**
 * ログイン系の画面。開発中（ログイン無効）は表示せず、タスク画面へ戻す。
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  if (!AUTH_ENABLED) redirect("/tasks");
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">{children}</main>
  );
}
