import { formatDue, isOverdue } from "@/lib/tasks";
import { PRIORITY_LABELS, type Label, type Priority, type Task } from "@/types/task";

const PRIORITY_STYLES: Record<Priority, string> = {
  high: "bg-red-50 text-red-700 ring-red-200",
  medium: "bg-amber-50 text-amber-800 ring-amber-200",
  low: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${PRIORITY_STYLES[priority]}`}
    >
      優先度 {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function DueDate({ task }: { task: Task }) {
  if (!task.dueDate) return null;
  const overdue = isOverdue(task);
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs ${
        overdue ? "font-semibold text-red-600" : "text-slate-500"
      }`}
    >
      <span aria-hidden>📅</span>
      <span className="sr-only">期限</span>
      {formatDue(task.dueDate)}
      {overdue && <span>（期限切れ）</span>}
    </span>
  );
}

export function LabelBadge({ label }: { label: Label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700">
      <span
        aria-hidden
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: label.color }}
      />
      {label.name}
    </span>
  );
}

export function TaskLabels({ task, labels }: { task: Task; labels: Label[] }) {
  const items = task.labelIds
    .map((id) => labels.find((l) => l.id === id))
    .filter((l): l is Label => Boolean(l));
  if (items.length === 0) return null;
  return (
    <>
      {items.map((l) => (
        <LabelBadge key={l.id} label={l} />
      ))}
    </>
  );
}
