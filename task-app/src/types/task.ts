export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in_progress" | "done";

export type Task = {
  id: string;
  title: string;
  description: string;
  /** YYYY-MM-DD。未設定は null */
  dueDate: string | null;
  priority: Priority;
  status: Status;
  /** 同じステータス列内の並び順（小さいほど上） */
  position: number;
  labelIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type Label = {
  id: string;
  name: string;
  /** #RRGGBB */
  color: string;
};

export type TaskInput = {
  title: string;
  description: string;
  dueDate: string | null;
  priority: Priority;
  status: Status;
  labelIds: string[];
};

export const STATUSES: Status[] = ["todo", "in_progress", "done"];

export const STATUS_LABELS: Record<Status, string> = {
  todo: "未着手",
  in_progress: "進行中",
  done: "完了",
};

export const PRIORITIES: Priority[] = ["high", "medium", "low"];

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "高",
  medium: "中",
  low: "低",
};
