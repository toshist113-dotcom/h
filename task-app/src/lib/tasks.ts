import type { Priority, Status, Task } from "@/types/task";

export type SortKey = "due" | "priority" | "created";

export const SORT_LABELS: Record<SortKey, string> = {
  due: "期限が近い順",
  priority: "優先度が高い順",
  created: "新しい順",
};

export type Filters = {
  q: string;
  status: Status | "";
  priority: Priority | "";
  labelId: string;
};

export const EMPTY_FILTERS: Filters = { q: "", status: "", priority: "", labelId: "" };

export function hasActiveFilters(f: Filters): boolean {
  return Boolean(f.q.trim() || f.status || f.priority || f.labelId);
}

export function filterTasks(tasks: Task[], f: Filters): Task[] {
  const q = f.q.trim().toLowerCase();
  return tasks.filter((t) => {
    if (q && !`${t.title}\n${t.description}`.toLowerCase().includes(q)) return false;
    if (f.status && t.status !== f.status) return false;
    if (f.priority && t.priority !== f.priority) return false;
    if (f.labelId && !t.labelIds.includes(f.labelId)) return false;
    return true;
  });
}

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function sortTasks(tasks: Task[], key: SortKey): Task[] {
  const copy = [...tasks];
  switch (key) {
    case "due":
      return copy.sort((a, b) => {
        if (a.dueDate === b.dueDate) return b.createdAt.localeCompare(a.createdAt);
        if (a.dueDate === null) return 1;
        if (b.dueDate === null) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    case "priority":
      return copy.sort(
        (a, b) =>
          PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
          b.createdAt.localeCompare(a.createdAt),
      );
    case "created":
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

/** ローカル日付の YYYY-MM-DD */
export function todayString(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function isOverdue(task: Task): boolean {
  return task.dueDate !== null && task.status !== "done" && task.dueDate < todayString();
}

export function formatDue(dueDate: string): string {
  const [, m, d] = dueDate.split("-");
  return `${Number(m)}/${Number(d)}`;
}
