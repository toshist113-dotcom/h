# CLAUDE.md

## 目的
個人利用のタスク管理Webアプリ（MVP）を作る。Next.js / Supabase / GitHub / Vercel / Node.js を使い、1人開発・無料枠で運用する。

## ドキュメントの場所
- 要件定義書: `docs/requirements.md`（機能要件・MVP対象外・受け入れ基準）
- 設計書: `docs/design.md`（構成・DB・Server Actions・画面・実装順序）
- アプリ本体: `task-app/`（Next.js, App Router, TypeScript, Tailwind CSS）

## 作業の進め方
- 実装前に要件定義書と設計書を読み、MVP対象外の機能は作らない。要件を変える場合は先にドキュメントを更新する。
- 今は**フロントエンドを先に作る**。データはまずモック（ローカル状態）で動かし、Supabase接続は後で差し替える。
- **ログイン機能は開発中は作らない・表示しない。** 公開前に追加する（設計書 8.2）。認証なしのまま本番公開しない。
- 起動は `task-app/` で `npm run dev`。Node.js は `%LOCALAPPDATA%\Programs\nodejs` に入れてある（PATHに無い場合は追加する）。
- データ層は `task-app/src/lib/store.ts`。Supabase の接続情報（`.env.local`）があれば Supabase、無ければ localStorage のモックで動く。SQLは `supabase/`、手順は `supabase/README.md`。
- `supabase/dev/` は開発用プロジェクト専用。本番プロジェクトには流さない。
- UIは日本語のみ、スマホ幅（375px）でも崩れないようにする。
- 小さく作って都度ビルド（`npm run build`）とlintで確認する。完了と言う前に動作を確認する。
- 秘密情報（`.env.local`、キー）はコミットしない。不明点は推測せず質問する。
