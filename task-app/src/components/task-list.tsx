"use client";

import { AnpanCheck } from "@/components/anpan-check";
import { ErasableTitle } from "@/components/erasable-title";
import { toggleDone } from "@/lib/store";
import { DueDate, PriorityBadge, TaskLabels } from "@/components/task-meta";
import { STATUS_LABELS, type Label, type Task } from "@/types/task";

type Props = {
  tasks: Task[];
  labels: Label[];
  onEdit: (task: Task) => void;
};

export function TaskList({ tasks, labels, onEdit }: Props) {
  return (
    <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
      {tasks.map((task) => {
        const done = task.status === "done";
        return (
          <li key={task.id} className="flex items-start gap-3 px-3 py-3 sm:px-4">
            <AnpanCheck
              checked={done}
              onChange={() => toggleDone(task.id)}
              aria-label={`「${task.title}」を${done ? "未完了に戻す" : "完了にする"}`}
            />
            <button
              type="button"
              onClick={() => onEdit(task)}
              title={task.title}
              className="min-w-0 flex-1 rounded text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              <span className="block">
                <ErasableTitle
                  title={task.title}
                  done={done}
                  className="text-sm font-medium text-slate-900"
                />
              </span>
              <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                  {STATUS_LABELS[task.status]}
                </span>
                <PriorityBadge priority={task.priority} />
                <DueDate task={task} />
                <TaskLabels task={task} labels={labels} />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
