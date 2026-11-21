"use client";

import { useState } from "react";
import { ErrorBanner } from "@/components/error-banner";
import { FilterBar } from "@/components/filter-bar";
import { KanbanBoard } from "@/components/kanban-board";
import { TaskForm } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import {
  EMPTY_FILTERS,
  filterTasks,
  hasActiveFilters,
  sortTasks,
  type Filters,
  type SortKey,
} from "@/lib/tasks";
import { addTask, deleteTask, updateTask, useStore } from "@/lib/store";
import type { Task } from "@/types/task";

type View = "list" | "board";
type Editing = { mode: "closed" } | { mode: "new" } | { mode: "edit"; task: Task };

export function TasksView() {
  const { ready, tasks, labels, error } = useStore();
  const [view, setView] = useState<View>("list");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("due");
  const [editing, setEditing] = useState<Editing>({ mode: "closed" });

  const filtered = filterTasks(tasks, filters);
  const visible = view === "list" ? sortTasks(filtered, sort) : filtered;
  const close = () => setEditing({ mode: "closed" });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-slate-900">タスク</h1>
        {ready && (
          <span className="text-sm text-slate-500">
            {hasActiveFilters(filters) ? `${visible.length} / ${tasks.length} 件` : `${tasks.length} 件`}
          </span>
        )}
        <div
          role="group"
          aria-label="表示切替"
          className="ml-auto flex overflow-hidden rounded-md border border-slate-300 bg-white text-sm"
        >
          {(["list", "board"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 ${
                view === v ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {v === "list" ? "一覧" : "カンバン"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setEditing({ mode: "new" })}
          className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          ＋ 新規タスク
        </button>
      </div>

      <ErrorBanner message={error} />

      <FilterBar
        filters={filters}
        onChange={setFilters}
        labels={labels}
        sort={sort}
        onSortChange={setSort}
        showSort={view === "list"}
      />

      {!ready ? (
        <p className="py-12 text-center text-sm text-slate-500">読み込み中…</p>
      ) : view === "board" ? (
        <KanbanBoard tasks={visible} labels={labels} onEdit={(task) => setEditing({ mode: "edit", task })} />
      ) : visible.length === 0 ? (
        <EmptyState
          filtered={hasActiveFilters(filters)}
          onCreate={() => setEditing({ mode: "new" })}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />
      ) : (
        <TaskList tasks={visible} labels={labels} onEdit={(task) => setEditing({ mode: "edit", task })} />
      )}

      {editing.mode === "new" && (
        <TaskForm
          labels={labels}
          onClose={close}
          onSubmit={(input) => {
            addTask(input);
            close();
          }}
        />
      )}
      {editing.mode === "edit" && (
        <TaskForm
          key={editing.task.id}
          task={editing.task}
          labels={labels}
          onClose={close}
          onSubmit={(input) => {
            updateTask(editing.task.id, input);
            close();
          }}
          onDelete={() => {
            deleteTask(editing.task.id);
            close();
          }}
        />
      )}
    </div>
  );
}

function EmptyState({
  filtered,
  onCreate,
  onReset,
}: {
  filtered: boolean;
  onCreate: () => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
      <p className="text-sm text-slate-600">
        {filtered ? "条件に一致するタスクがありません。" : "タスクがまだありません。"}
      </p>
      <button
        type="button"
        onClick={filtered ? onReset : onCreate}
        className="mt-3 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        {filtered ? "絞り込みを解除" : "最初のタスクを作成"}
      </button>
    </div>
  );
}
