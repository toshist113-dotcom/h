import type { Metadata } from "next";
import { Backdrop } from "@/components/backdrop";
import "./globals.css";

export const metadata: Metadata = {
  title: "タスク管理",
  description: "個人向けのシンプルなタスク管理アプリ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <Backdrop />
        {children}
      </body>
    </html>
  );
}
