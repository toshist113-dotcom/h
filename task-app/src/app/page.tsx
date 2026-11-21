import { redirect } from "next/navigation";

// 開発中はログインなしで直接タスク画面へ（ログインは公開前に追加）
export default function Home() {
  redirect("/tasks");
}
