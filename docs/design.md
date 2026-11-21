# タスク管理アプリ（MVP）設計書

要件は [requirements.md](requirements.md) を参照。

## 1. 設計方針
- Next.js App Router の Server Components + Server Actions を中心にし、独自のAPIルートは作らない。
- データアクセスは Supabase（`@supabase/ssr`）経由。認可はDBのRLSで担保し、アプリ側でも `getUser()` で認証確認する。
- MVPのため状態管理ライブラリは入れない。カンバンのみクライアントコンポーネント。
- 技術選定（確定案）: Tailwind CSS、dnd-kit（ドラッグ&ドロップ）、zod（入力検証）、Vitest（ユニットテスト）。

## 2. アーキテクチャ
```
ブラウザ ──> Vercel (Next.js App Router)
              ├─ middleware.ts        : セッション更新・未ログイン時リダイレクト
              ├─ Server Components    : 一覧/カンバンのデータ取得
              └─ Server Actions       : 作成/更新/削除（zod検証 → Supabase）
                          │
                          ▼
                    Supabase (Postgres + Auth, RLS有効)
```
- 環境変数: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` のみ。service role キーは使用しない。
- ブランチ運用: `main`（本番）＋ 作業ブランチ（PRでVercelプレビュー）。

### 実装での変更点（フロント先行開発の結果）
- データ取得・更新は Server Actions ではなく、ブラウザ側のストア（`lib/store.ts`）から Supabase（`@supabase/ssr` のブラウザクライアント）を直接呼ぶ。認可はRLSが担うため安全性は変わらない。Supabase 未設定のときは localStorage のモックで動く。
- 保存は画面へ先に反映（楽観的更新）し、失敗したらエラー表示してサーバーの状態を読み直す。
- 検索・絞り込みの状態は URL ではなく画面内の状態で持つ。
- ユーザーIDは `lib/auth.ts` の `getCurrentUserId()` だけが決める（開発中は `NEXT_PUBLIC_DEV_USER_ID`、本番ビルドで `NEXT_PUBLIC_AUTH_ENABLED` が true でなければ拒否）。

## 3. ディレクトリ構成
```
src/
  app/
    (auth)/login/page.tsx         # ※公開前に追加（開発中は作らない）
    (auth)/signup/page.tsx        # ※公開前に追加
    (auth)/reset-password/page.tsx # ※公開前に追加
    auth/callback/route.ts        # ※公開前に追加。メール確認・再設定のコード交換
    (app)/layout.tsx              # ヘッダー（ログアウトは公開前に追加）
    (app)/tasks/page.tsx          # 一覧 / カンバン（?view=list|board）
    (app)/labels/page.tsx         # ラベル管理
    actions/tasks.ts              # Server Actions
    actions/labels.ts
    actions/auth.ts               # ※公開前に追加
  components/
    task-list.tsx / task-card.tsx / task-form.tsx
    kanban-board.tsx              # "use client"（dnd-kit）
    filter-bar.tsx / label-badge.tsx
  lib/
    supabase/{server,client,middleware}.ts
    validation.ts                 # zodスキーマ
    ordering.ts                   # position計算
  types/database.ts               # supabase gen types の出力
middleware.ts
supabase/migrations/0001_init.sql
```

## 4. データベース設計
```sql
create type task_priority as enum ('low','medium','high');
create type task_status   as enum ('todo','in_progress','done');

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '' check (char_length(description) <= 5000),
  due_date date,
  priority task_priority not null default 'medium',
  status task_status not null default 'todo',
  position double precision not null default 0,   -- 列内の並び順
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_user_status_pos on tasks (user_id, status, position);
create index tasks_user_due on tasks (user_id, due_date);

create table labels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(name) between 1 and 30),
  color text not null default '#64748b' check (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table task_labels (
  task_id  uuid not null references tasks(id)  on delete cascade,
  label_id uuid not null references labels(id) on delete cascade,
  primary key (task_id, label_id)
);

-- updated_at 自動更新トリガー（tasks）
create function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger tasks_updated before update on tasks
  for each row execute function set_updated_at();

-- RLS
alter table tasks enable row level security;
alter table labels enable row level security;
alter table task_labels enable row level security;

-- ※ 実際のSQLは supabase/migrations/0001_init.sql（公開用ポリシーのみ。本番にも適用してよい）。
-- ログインなしの開発用設定（固定の開発用ユーザー + anon 全許可ポリシー）は migrations とは別に
-- supabase/dev/dev_open_access.sql に分け、開発用プロジェクトにだけ適用する（本番には適用しない）。
-- 公開前のログイン追加時は supabase/dev/remove_dev_access.sql で撤去する。

-- 【公開用ポリシー】本番プロジェクトは最初からこちらのみ
create policy tasks_own  on tasks  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy labels_own on labels for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy task_labels_own on task_labels for all
  using (exists (select 1 from tasks  t where t.id = task_id  and t.user_id = auth.uid()))
  with check (
    exists (select 1 from tasks  t where t.id = task_id  and t.user_id = auth.uid()) and
    exists (select 1 from labels l where l.id = label_id and l.user_id = auth.uid())
  );
```
- 「完了」= `status = 'done'`。完了フラグ列は持たない。
- 並び順: 並べ替え時は前後タスクの `position` の中間値を設定（先頭=最小値-1、末尾=最大値+1）。間隔が極端に小さくなった場合のみ列を再採番する。

## 5. Server Actions（インターフェース）
| 関数 | 入力 | 内容 |
|---|---|---|
| `createTask` | title, description?, dueDate?, priority, status, labelIds[] | tasks挿入 → task_labels挿入 |
| `updateTask` | id + 上記の部分更新 | 更新、ラベルは差分置換 |
| `deleteTask` | id | 削除 |
| `moveTask` | id, status, beforeId?, afterId? | status変更とposition再計算（カンバンDnD用） |
| `toggleDone` | id | done ⇔ todo |
| `createLabel / updateLabel / deleteLabel` | name, color | ラベルCRUD |
| `signUp / signIn / signOut / requestPasswordReset / updatePassword` | メール・パスワード | Supabase Auth |

- すべて zod で検証し、結果は `{ ok: true } | { ok: false, error: string }` で返す。成功後は `revalidatePath('/tasks')`。
- カンバンは楽観的更新（`useOptimistic`）で即時反映し、失敗時は元に戻してエラー表示。

## 6. 検索・絞り込み・並べ替え
URLクエリで状態を保持（共有・リロードに強い）。
`/tasks?view=board&q=keyword&label=<id>&status=todo&priority=high&sort=due`
- 検索: `title ilike %q% or description ilike %q%`（MVPは件数が少ないためインデックス不要。`%`/`_` はエスケープ）
- ラベル絞り込み: `task_labels` を `inner join` した埋め込みクエリ
- 並べ替え: `due`（期限昇順、nullは最後）/ `priority`（高→低）/ `created`（新しい順）
- カンバン表示時の列内順は `position`。

## 7. 画面設計
| 画面 | 要点 |
|---|---|
| ログイン/新規登録 | メール・パスワード、エラー文言は日本語。登録後はメール確認 → `/auth/callback` |
| タスク一覧 | 上部にフィルターバー、行に チェックボックス・タイトル・期限・優先度・ラベル。期限切れは赤表示 |
| カンバン | 3列。PCはドラッグ、スマホは横スクロールとカード内メニューから「移動」 |
| タスクフォーム | モーダル。タイトル必須、期限、優先度、ステータス、ラベル複数選択 |
| ラベル管理 | 一覧、追加、名称・色の編集、削除（付与済みタスクからも外れる旨を確認） |

- 共通ヘッダー: 「タスク」「ラベル」「ログアウト」。スマホは折りたたみメニュー。
- 空状態・読み込み中・エラーの表示を各画面で用意する。

## 8. 認証・セキュリティ設計
### 8.1 開発中（ログインなし）
- ログイン/登録/再設定画面、ヘッダーのログアウト、`middleware.ts` のリダイレクトは作らない・表示しない。`/` から直接 `/tasks` へ遷移する。
- 環境変数 `AUTH_ENABLED=false`（既定）の間は、Server Actions が固定の `DEV_USER_ID` で動作する。データ取得も `lib/auth.ts` の `getCurrentUserId()` 経由に統一し、認証の有無をこの1箇所に閉じ込める（`AUTH_ENABLED=true` なら `auth.getUser()` を返す）。
- 接続先は開発用Supabaseプロジェクトのみ。`dev_open_*` ポリシーは本番プロジェクトに適用しない。
- 本番ビルドで `AUTH_ENABLED=false` の場合は起動時エラーにする（`NODE_ENV=production` かつ `AUTH_ENABLED!=true` なら throw）。誤公開の防止策。

### 8.2 公開前のログイン追加手順（リリースゲート）
1. `(auth)` 配下のログイン/登録/再設定画面、`auth/callback`、`actions/auth.ts`、ヘッダーのログアウトを追加
2. `middleware.ts` を追加し、`(app)` 配下を未ログインなら `/login` へ
3. `supabase/dev/remove_dev_access.sql` で `dev_open_*` ポリシーを drop し、開発用ユーザーとそのデータを破棄
4. `AUTH_ENABLED=true` に切替、`DEV_USER_ID` 関連のコードと環境変数を削除
5. 2ユーザーでRLSを確認し、未ログインで `/tasks` に入れないことを確認

### 8.3 公開時の設計
- `middleware.ts` で全リクエストのセッションを更新し、`(app)` 配下は未ログインなら `/login` へ。
- Supabase側設定: Site URL を本番URL、Redirect URLs にプレビュー/ローカルを追加。
- RLSを唯一の認可境界とし、Server Actionでも `auth.getUser()` を確認。
- 入力はサーバー側で zod 検証。XSSはReactの標準エスケープに依存し、`dangerouslySetInnerHTML` は使わない。
- `.env.local` はGit管理外。VercelのEnvironment Variablesに同値を設定。

## 9. テスト方針
- ユニット（Vitest）: `validation.ts`、`ordering.ts`（position計算）、検索文字列エスケープ
- RLS確認: 2ユーザーでSQL/クライアントから他人の行にアクセスできないことを手動確認（受け入れ基準）
- E2Eは MVP では手動チェックリスト（要件8章）。余力があれば Playwright を追加。

## 10. 実装順序（タスク分解）
1. Next.js 初期化、Tailwind、ESLint/Prettier、GitHubリポジトリ、Vercel連携
2. Supabase開発用プロジェクト作成、`0001_init.sql` 適用（`dev_open_*` 含む）、開発用ユーザーseed、型生成、`lib/auth.ts`（`AUTH_ENABLED=false`）
3. タスクCRUD（一覧、フォーム、完了切替）
4. 優先度・期限・並べ替え
5. カンバン（dnd-kit、`moveTask`、楽観的更新）
6. ラベル管理・ラベル付与
7. 検索・絞り込み
8. レスポンシブ調整、空状態/エラー表示
9. **ログイン機能の追加（8.2の手順。公開の必須ゲート）**
10. 受け入れ確認、本番Supabaseプロジェクト作成、本番公開

## 11. 決定事項と未決事項
- 決定: Server Actions中心／position は double precision の中間値方式／状態はURLクエリで保持
- 未決: UIコンポーネントの出し方（素のTailwind か shadcn/ui か）。実装着手時に決める
- 注意: Supabase Freeは無操作で一時停止され得る。公開後に気になるなら定期アクセスを検討
