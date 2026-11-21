-- ★ 開発用Supabaseプロジェクト専用。本番プロジェクトには絶対に適用しないこと ★
-- ログインなしで動かすための、固定の開発用ユーザーと「anon に全許可」ポリシー。
-- 0001_init.sql の適用後に、SQL Editor で実行する。
-- 公開前のログイン追加時に remove_dev_access.sql で撤去する。

-- 開発用ユーザー（アプリ側の NEXT_PUBLIC_DEV_USER_ID と同じ値）
insert into auth.users (id, aud, role, email, created_at, updated_at)
values (
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'dev@example.invalid',
  now(),
  now()
)
on conflict (id) do nothing;

-- ログインなし（anon ロール）での操作権限
grant select, insert, update, delete on tasks, labels, task_labels to anon;

create policy dev_open_tasks on tasks
  for all to anon using (true) with check (true);
create policy dev_open_labels on labels
  for all to anon using (true) with check (true);
create policy dev_open_task_labels on task_labels
  for all to anon using (true) with check (true);
