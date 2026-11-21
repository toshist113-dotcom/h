"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { ErasableTitle } from "@/components/erasable-title";
import { moveTask } from "@/lib/store";
import { DueDate, PriorityBadge, TaskLabels } from "@/components/task-meta";
import { STATUSES, STATUS_LABELS, type Label, type Status, type Task } from "@/types/task";

type Props = {
  tasks: Task[];
  labels: Label[];
  onEdit: (task: Task) => void;
};

const COLUMN_TONE: Record<Status, string> = {
  todo: "bg-slate-400",
  in_progress: "bg-indigo-500",
  done: "bg-emerald-500",
};

export function KanbanBoard({ tasks, labels, onEdit }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );
  const activeTask = tasks.find((t) => t.id === activeId) ?? null;

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const id = String(active.id);
    const overId = String(over.id);
    if (overId.startsWith("col:")) {
      moveTask(id, overId.slice(4) as Status, null);
    } else if (overId.startsWith("task:")) {
      const target = tasks.find((t) => t.id === overId.slice(5));
      if (target && target.id !== id) moveTask(id, target.status, target.id);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex snap-x gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
        {STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasks
              .filter((t) => t.status === status)
              .sort((a, b) => a.position - b.position)}
            labels={labels}
            onEdit={onEdit}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <CardBody task={activeTask} labels={labels} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column({
  status,
  tasks,
  labels,
  onEdit,
}: {
  status: Status;
  tasks: Task[];
  labels: Label[];
  onEdit: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col:${status}` });
  return (
    <section
      ref={setNodeRef}
      aria-label={STATUS_LABELS[status]}
      className={`flex min-h-48 w-[85%] shrink-0 snap-start flex-col rounded-lg border p-2 md:w-auto ${
        isOver ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-slate-100"
      }`}
    >
      <h2 className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold text-slate-700">
        <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${COLUMN_TONE[status]}`} />
        {STATUS_LABELS[status]}
        <span className="ml-auto rounded-full bg-white px-2 text-xs font-normal text-slate-500">
          {tasks.length}
        </span>
      </h2>
      <ul className="flex flex-1 flex-col gap-2">
        {tasks.map((task) => (
          <Card key={task.id} task={task} labels={labels} onEdit={onEdit} />
        ))}
      </ul>
    </section>
  );
}

function Card({
  task,
  labels,
  onEdit,
}: {
  task: Task;
  labels: Label[];
  onEdit: (task: Task) => void;
}) {
  const drag = useDraggable({ id: task.id });
  const drop = useDroppable({ id: `task:${task.id}` });
  return (
    <li
      ref={(el) => {
        drag.setNodeRef(el);
        drop.setNodeRef(el);
      }}
      className={drag.isDragging ? "opacity-40" : ""}
    >
      <CardBody
        task={task}
        labels={labels}
        onEdit={onEdit}
        handleProps={{ ...drag.attributes, ...drag.listeners }}
        highlight={drop.isOver && !drag.isDragging}
      />
    </li>
  );
}

function CardBody({
  task,
  labels,
  onEdit,
  handleProps,
  highlight,
  overlay,
}: {
  task: Task;
  labels: Label[];
  onEdit?: (task: Task) => void;
  handleProps?: Record<string, unknown>;
  highlight?: boolean;
  overlay?: boolean;
}) {
  return (
    <div
      className={`rounded-md border bg-white p-2.5 shadow-sm ${
        highlight ? "border-indigo-400 ring-2 ring-indigo-200" : "border-slate-200"
      } ${overlay ? "rotate-1 shadow-lg" : ""}`}
    >
      <div className="flex items-start gap-1.5">
        <button
          type="button"
          aria-label={`「${task.title}」をドラッグして移動`}
          className="-ml-1 mt-0.5 shrink-0 cursor-grab touch-none rounded px-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
          {...handleProps}
        >
          ⠿
        </button>
        <button
          type="button"
          onClick={() => onEdit?.(task)}
          title={task.title}
          className="min-w-0 flex-1 rounded text-left text-sm font-medium text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        >
          <ErasableTitle title={task.title} done={task.status === "done"} />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <PriorityBadge priority={task.priority} />
        <DueDate task={task} />
        <TaskLabels task={task} labels={labels} />
      </div>
      {!overlay && (
        <label className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          移動
          <select
            value={task.status}
            onChange={(e) => moveTask(task.id, e.target.value as Status, null)}
            className="h-7 rounded border border-slate-300 bg-white px-1 text-xs text-slate-700"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
