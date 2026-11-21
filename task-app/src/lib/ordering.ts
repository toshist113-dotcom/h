import type { Status, Task } from "@/types/task";

/** 指定ステータス列の末尾に置くときの position */
export function nextPosition(tasks: Task[], status: Status): number {
  const positions = tasks.filter((t) => t.status === status).map((t) => t.position);
  return positions.length ? Math.max(...positions) + 1 : 1;
}

/**
 * movingId を status 列の beforeId の直前に置くときの position。
 * beforeId が null（または列内に無い）場合は末尾。前後の中間値を返す。
 */
export function positionBefore(
  tasks: Task[],
  movingId: string,
  status: Status,
  beforeId: string | null,
): number {
  const column = tasks
    .filter((t) => t.status === status && t.id !== movingId)
    .sort((a, b) => a.position - b.position);
  const end = column.length ? column[column.length - 1].position + 1 : 1;
  if (beforeId === null) return end;
  const index = column.findIndex((t) => t.id === beforeId);
  if (index === -1) return end;
  const next = column[index].position;
  const prev = index > 0 ? column[index - 1].position : next - 2;
  return (prev + next) / 2;
}
