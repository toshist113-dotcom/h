"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  type Label,
  type Priority,
  type Status,
  type Task,
  type TaskInput,
} from "@/types/task";

type Props = {
  /** 編集対象。未指定なら新規作成 */
  task?: Task;
  labels: Label[];
  onSubmit: (input: TaskInput) => void;
  onDelete?: () => void;
  onClose: () => void;
};

const field =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

export function TaskForm({ task, labels, onSubmit, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "medium");
  const [status, setStatus] = useState<Status>(task?.status ?? "todo");
  const [labelIds, setLabelIds] = useState<string[]>(task?.labelIds ?? []);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function toggleLabel(id: string) {
    setLabelIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("タイトルを入力してください");
      return;
    }
    if (trimmed.length > 200) {
      setError("タイトルは200文字以内で入力してください");
      return;
    }
    if (description.length > 5000) {
      setError("説明は5000文字以内で入力してください");
      return;
    }
    onSubmit({
      title: trimmed,
      description,
      dueDate: dueDate || null,
      priority,
      status,
      labelIds,
    });
  }

  function handleDelete() {
    if (window.confirm("このタスクを削除しますか？この操作は元に戻せません。")) {
      onDelete?.();
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-xl bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-xl"
      >
        <h2 id="task-form-title" className="mb-4 text-lg font-bold text-slate-900">
          {task ? "タスクを編集" : "新規タスク"}
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="tf-title" className="mb-1 block text-sm font-medium text-slate-700">
              タイトル <span className="text-red-600">*</span>
            </label>
            <input
              id="tf-title"
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "tf-error" : undefined}
              className={field}
            />
            {error && (
              <p id="tf-error" role="alert" className="mt-1 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="tf-desc" className="mb-1 block text-sm font-medium text-slate-700">
              説明
            </label>
            <textarea
              id="tf-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={field}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="tf-due" className="mb-1 block text-sm font-medium text-slate-700">
                期限
              </label>
              <input
                id="tf-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="tf-pri" className="mb-1 block text-sm font-medium text-slate-700">
                優先度
              </label>
              <select
                id="tf-pri"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className={field}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tf-status" className="mb-1 block text-sm font-medium text-slate-700">
                ステータス
              </label>
              <select
                id="tf-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className={field}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset>
            <legend className="mb-1 block text-sm font-medium text-slate-700">ラベル</legend>
            {labels.length === 0 ? (
              <p className="text-sm text-slate-500">
                ラベルがありません。「ラベル」画面で作成できます。
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {labels.map((l) => {
                  const on = labelIds.includes(l.id);
                  return (
                    <label
                      key={l.id}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm ${
                        on
                          ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleLabel(l.id)}
                        className="sr-only"
                      />
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: l.color }}
                      />
                      {l.name}
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>
        </div>

        <div className="mt-6 flex items-center gap-2">
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              削除
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {task ? "保存" : "作成"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
