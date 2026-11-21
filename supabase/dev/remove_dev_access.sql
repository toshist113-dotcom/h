-- 公開前のログイン追加時に実行する（開発用Supabaseプロジェクト用）。
-- 開発用の全許可ポリシーと、開発用ユーザー（とそのデータ）を撤去する。

revoke all on tasks, labels, task_labels from anon;

drop policy if exists dev_open_tasks on tasks;
drop policy if exists dev_open_labels on labels;
drop policy if exists dev_open_task_labels on task_labels;

-- tasks / labels は on delete cascade で一緒に消える
delete from auth.users where id = '00000000-0000-0000-0000-000000000001';
