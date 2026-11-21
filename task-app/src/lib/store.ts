/**
 * アプリのデータ置き場。画面は useStore() と下の操作関数だけを使う。
 * - Supabase の接続情報があれば Supabase に保存する（lib/supabase-repository.ts）
 * - 無ければブラウザの localStorage に保存するモックで動く（初回はサンプルデータ入り）
 * 画面には先に反映し（楽観的更新）、保存に失敗したら error を出してサーバーの状態を読み直す。
 */
import { useSyncExternalStore } from "react";
import { nextPosition, positionBefore } from "@/lib/ordering";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import * as remote from "@/lib/supabase-repository";
import { addDays } from "@/lib/tasks";
import type { Label, Status, Task, TaskInput } from "@/types/task";

export type StoreState = {
  /** データの読み込みが済んだか */
  ready: boolean;
  tasks: Task[];
  labels: Label[];
  /** 直近の保存・読み込みの失敗（画面に表示する） */
  error: string | null;
};

type Data = Pick<StoreState, "tasks" | "labels">;

const STORAGE_KEY = "task-app:mock:v1";
const SERVER_STATE: StoreState = { ready: false, tasks: [], labels: [], error: null };

let state: StoreState = SERVER_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function newId(): string {
  return crypto.randomUUID();
}

function emit() {
  listeners.forEach((l) => l());
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "不明なエラーが発生しました";
}

/* ---------- 読み込み ---------- */

function seed(): Data {
  const now = new Date().toISOString();
  const labels: Label[] = [
    { id: newId(), name: "仕事", color: "#2563eb" },
    { id: newId(), name: "個人", color: "#16a34a" },
    { id: newId(), name: "学習", color: "#d97706" },
  ];
  const make = (
    i: number,
    title: string,
    status: Status,
    priority: Task["priority"],
    dueOffset: number | null,
    labelIdx: number[],
    description = "",
  ): Task => ({
    id: newId(),
    title,
    description,
    dueDate: dueOffset === null ? null : addDays(dueOffset),
    priority,
    status,
    position: i,
    labelIds: labelIdx.map((n) => labels[n].id),
    createdAt: new Date(Date.now() - (10 - i) * 3600_000).toISOString(),
    updatedAt: now,
  });
  return {
    labels,
    tasks: [
      make(1, "要件定義書を見直す", "todo", "high", 1, [0], "MVPの範囲を再確認する"),
      make(2, "請求書を送る", "todo", "medium", -1, [0]),
      make(3, "Next.js のチュートリアルを進める", "in_progress", "medium", 5, [2]),
      make(4, "歯医者の予約", "todo", "low", null, [1]),
      make(5, "デザイン案をまとめる", "done", "low", -3, [0]),
    ],
  };
}

function loadMock(): Data {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Data;
      if (Array.isArray(parsed.tasks) && Array.isArray(parsed.labels)) return parsed;
    }
  } catch {
    // 破損データや localStorage 不可の場合は初期データで開始
  }
  return seed();
}

/** Supabase から読み直す。失敗したら error を出す */
function refresh() {
  remote
    .loadAll()
    .then((data) => {
      state = { ready: true, error: state.error, ...data };
      emit();
    })
    .catch((e) => {
      state = { ...state, ready: true, error: `読み込みに失敗しました: ${errorMessage(e)}` };
      emit();
    });
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  if (isSupabaseConfigured) {
    refresh(); // 結果が届くまでは ready: false のまま
  } else {
    state = { ready: true, error: null, ...loadMock() };
  }
}

/* ---------- 書き込み ---------- */

function commit(next: Data) {
  state = { ...state, ...next };
  if (!isSupabaseConfigured) {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tasks: state.tasks, labels: state.labels }),
      );
    } catch {
      // 保存できなくても画面上は動かす
    }
  }
  emit();
}

/** Supabase への保存。失敗したらメッセージを出して、サーバーの状態に戻す */
function persist(job: () => Promise<void>) {
  if (!isSupabaseConfigured) return;
  job().catch((e) => {
    state = { ...state, error: `保存に失敗しました: ${errorMessage(e)}` };
    emit();
    refresh();
  });
}

/**
 * 保持しているデータを捨てる。ログイン・ログアウトでユーザーが変わるときに呼ぶ
 * （前のユーザーのデータが残らないように。次に画面が開いたとき、読み込み直す）。
 */
export function resetStore() {
  loaded = false;
  state = SERVER_STATE;
}

export function dismissError() {
  state = { ...state, error: null };
  emit();
}

/* ---------- 購読 ---------- */

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): StoreState {
  load();
  return state;
}

function getServerSnapshot(): StoreState {
  return SERVER_STATE;
}

export function useStore(): StoreState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* ---------- タスク操作 ---------- */

export function addTask(input: TaskInput) {
  const now = new Date().toISOString();
  const task: Task = {
    ...input,
    id: newId(),
    position: nextPosition(state.tasks, input.status),
    createdAt: now,
    updatedAt: now,
  };
  commit({ tasks: [...state.tasks, task], labels: state.labels });
  persist(() => remote.saveTask(task));
}

export function updateTask(id: string, input: TaskInput) {
  const current = state.tasks.find((t) => t.id === id);
  if (!current) return;
  const statusChanged = current.status !== input.status;
  const updated: Task = {
    ...current,
    ...input,
    position: statusChanged ? nextPosition(state.tasks, input.status) : current.position,
    updatedAt: new Date().toISOString(),
  };
  commit({ tasks: state.tasks.map((t) => (t.id === id ? updated : t)), labels: state.labels });
  persist(() => remote.saveTask(updated));
}

export function deleteTask(id: string) {
  commit({ tasks: state.tasks.filter((t) => t.id !== id), labels: state.labels });
  persist(() => remote.removeTask(id));
}

export function toggleDone(id: string) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;
  moveTask(id, task.status === "done" ? "todo" : "done", null);
}

/** カンバン用: id を status 列の beforeId の直前（null なら末尾）へ移動 */
export function moveTask(id: string, status: Status, beforeId: string | null) {
  const current = state.tasks.find((t) => t.id === id);
  if (!current) return;
  const moved: Task = {
    ...current,
    status,
    position: positionBefore(state.tasks, id, status, beforeId),
    updatedAt: new Date().toISOString(),
  };
  commit({ tasks: state.tasks.map((t) => (t.id === id ? moved : t)), labels: state.labels });
  persist(() => remote.saveTask(moved));
}

/* ---------- ラベル操作 ---------- */

export function addLabel(name: string, color: string) {
  const label: Label = { id: newId(), name, color };
  commit({ tasks: state.tasks, labels: [...state.labels, label] });
  persist(() => remote.saveLabel(label));
}

export function updateLabel(id: string, name: string, color: string) {
  const label: Label = { id, name, color };
  commit({
    tasks: state.tasks,
    labels: state.labels.map((l) => (l.id === id ? label : l)),
  });
  persist(() => remote.saveLabel(label));
}

export function deleteLabel(id: string) {
  commit({
    labels: state.labels.filter((l) => l.id !== id),
    tasks: state.tasks.map((t) =>
      t.labelIds.includes(id) ? { ...t, labelIds: t.labelIds.filter((x) => x !== id) } : t,
    ),
  });
  persist(() => remote.removeLabel(id));
}
