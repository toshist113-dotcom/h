-- タスク管理アプリ MVP: 初期スキーマ（開発・本番の両方に適用してよい）
-- ログインなしの開発用設定は含めない（supabase/dev/ を参照。本番プロジェクトには適用しない）

create type task_priority as enum ('low', 'medium', 'high');
create type task_status   as enum ('todo', 'in_progress', 'done');

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '' check (char_length(description) <= 5000),
  due_date date,
  priority task_priority not null default 'medium',
  status task_status not null default 'todo',
  position double precision not null default 0, -- 同じステータス列内の並び順
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_user_status_pos on tasks (user_id, status, position);
create index tasks_user_due on tasks (user_id, due_date);

create table labels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null check (char_length(name) between 1 and 30),
  color text not null default '#64748b' check (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table task_labels (
  task_id uuid not null references tasks (id) on delete cascade,
  label_id uuid not null references labels (id) on delete cascade,
  primary key (task_id, label_id)
);
create index task_labels_label on task_labels (label_id);

-- updated_at を自動更新
create function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger tasks_set_updated_at
  before update on tasks
  for each row execute function set_updated_at();

-- API からの操作権限（新しい Supabase プロジェクトでは自動で付かないことがある）。
-- 実際に操作できる行は、下の RLS ポリシーで自分の行だけに絞られる。
grant select, insert, update, delete on tasks, labels, task_labels to authenticated;

-- RLS: 自分の行だけ操作できる（認証ユーザーのみ）
alter table tasks enable row level security;
alter table labels enable row level security;
alter table task_labels enable row level security;

create policy tasks_own on tasks
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy labels_own on labels
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy task_labels_own on task_labels
  for all to authenticated
  using (exists (select 1 from tasks t where t.id = task_id and t.user_id = auth.uid()))
  with check (
    exists (select 1 from tasks t where t.id = task_id and t.user_id = auth.uid())
    and exists (select 1 from labels l where l.id = label_id and l.user_id = auth.uid())
  );
