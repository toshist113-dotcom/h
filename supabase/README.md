# Supabase の準備手順

## ファイル
- `migrations/0001_init.sql` … テーブル・トリガー・RLS（公開用ポリシーのみ。開発・本番どちらにも適用してよい）
- `dev/dev_open_access.sql` … **開発用プロジェクト専用**。ログインなしで動かすための開発用ユーザーと全許可ポリシー
- `dev/remove_dev_access.sql` … 公開前のログイン追加時に実行して、上を撤去する

## 開発用プロジェクトの準備（自分で行う）
1. Supabase のダッシュボードで**開発用**プロジェクトを作成する（本番とは別に作る）。
2. SQL Editor で `migrations/0001_init.sql` → `dev/dev_open_access.sql` の順に実行する。
3. Project Settings > API の **Project URL** と **anon public キー**を、`task-app/.env.local` に書く（`task-app/.env.example` を参照）。service_role キーは使わない・書かない。
4. `npm run dev` を再起動する。タスク一覧が空で出れば接続成功（サンプルデータは入らない）。

## 本番プロジェクト
`migrations/0001_init.sql` だけを適用する。`dev/` のSQLは絶対に流さない。
