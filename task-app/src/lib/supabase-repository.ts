/**
 * Supabase に読み書きするデータ層。store.ts から使う（接続情報があるときだけ）。
 * アクセス制限は DB 側の RLS が担う。ユーザーIDは lib/auth.ts から取る。
 */
import { getCurrentUserId } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase/client";
import type { Label, Priority, Status, Task } from "@/types/task";

type TaskRow = {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  priority: Priority;
  status: Status;
  position: number;
  created_at: string;
  updated_at: string;
  task_labels: { label_id: string }[];
};

type LabelRow = { id: string; name: string; color: string };

function check(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function loadAll(): Promise<{ tasks: Task[]; labels: Label[] }> {
  const supabase = getSupabase();
  const [tasks, labels] = await Promise.all([
    supabase.from("tasks").select("*, task_labels(label_id)").order("position"),
    supabase.from("labels").select("id, name, color").order("created_at"),
  ]);
  check(tasks.error);
  check(labels.error);
  return {
    tasks: ((tasks.data ?? []) as TaskRow[]).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      dueDate: r.due_date,
      priority: r.priority,
      status: r.status,
      position: r.position,
      labelIds: r.task_labels.map((l) => l.label_id),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
    labels: (labels.data ?? []) as LabelRow[],
  };
}

/** タスクの追加・更新（ラベルの付け替えを含む） */
export async function saveTask(task: Task): Promise<void> {
  const supabase = getSupabase();
  const userId = await getCurrentUserId();

  const { error } = await supabase.from("tasks").upsert({
    id: task.id,
    user_id: userId,
    title: task.title,
    description: task.description,
    due_date: task.dueDate,
    priority: task.priority,
    status: task.status,
    position: task.position,
    created_at: task.createdAt,
  });
  check(error);

  const cleared = await supabase.from("task_labels").delete().eq("task_id", task.id);
  check(cleared.error);
  if (task.labelIds.length > 0) {
    const inserted = await supabase
      .from("task_labels")
      .insert(task.labelIds.map((label_id) => ({ task_id: task.id, label_id })));
    check(inserted.error);
  }
}

export async function removeTask(id: string): Promise<void> {
  const { error } = await getSupabase().from("tasks").delete().eq("id", id);
  check(error);
}

export async function saveLabel(label: Label): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await getSupabase()
    .from("labels")
    .upsert({ id: label.id, user_id: userId, name: label.name, color: label.color });
  check(error);
}

/** task_labels は on delete cascade で DB 側で外れる */
export async function removeLabel(id: string): Promise<void> {
  const { error } = await getSupabase().from("labels").delete().eq("id", id);
  check(error);
}
