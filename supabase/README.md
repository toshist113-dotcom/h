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

## ログインを有効にするときの Supabase 設定（本番プロジェクト）
アプリ側は `NEXT_PUBLIC_AUTH_ENABLED=true` で有効になる。Supabase のダッシュボードでは次を設定する。
1. **Authentication > URL Configuration**
   - **Site URL**: 公開した本番のURL（`https://〜.vercel.app`）
   - **Redirect URLs**: `https://〜.vercel.app/auth/callback`（ローカル確認用に `http://localhost:3000/auth/callback` も）
2. **Authentication > Providers > Email**: Email を有効、「Confirm email」（メール確認）は有効のままにする。
3. **Authentication > Policies（Password）**: 最小文字数を8以上にする（アプリ側のチェックと合わせる）。
4. 無料枠のメール送信は回数に制限がある（短時間に多く送ると「しばらく待って」と出る）。
5. Vercel の環境変数に、本番の `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `NEXT_PUBLIC_AUTH_ENABLED=true` を設定して再デプロイする（`NEXT_PUBLIC_DEV_USER_ID` は不要）。
