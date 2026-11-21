"use client";

import { useState, type FormEvent } from "react";
import { ErrorBanner } from "@/components/error-banner";
import { addLabel, deleteLabel, updateLabel, useStore } from "@/lib/store";
import type { Label } from "@/types/task";

const PRESET_COLORS = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#dc2626",
  "#9333ea",
  "#0891b2",
  "#db2777",
  "#64748b",
];

const input =
  "h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

export function LabelsManager() {
  const { ready, labels, tasks, error: storeError } = useStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState("");

  function validate(value: string, ignoreId?: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "ラベル名を入力してください";
    if (trimmed.length > 30) return "ラベル名は30文字以内で入力してください";
    if (labels.some((l) => l.id !== ignoreId && l.name === trimmed)) {
      return "同じ名前のラベルが既にあります";
    }
    return "";
  }

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    const message = validate(name);
    if (message) {
      setError(message);
      return;
    }
    addLabel(name.trim(), color);
    setName("");
    setError("");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-xl font-bold text-slate-900">ラベル</h1>

      <ErrorBanner message={storeError} />

      <form onSubmit={handleAdd} className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">ラベルを追加</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="ラベル名"
            aria-label="ラベル名"
            aria-invalid={Boolean(error)}
            className={`${input} min-w-0 flex-1`}
          />
          <ColorPicker value={color} onChange={setColor} />
          <button
            type="submit"
            className="h-9 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
          >
            追加
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </form>

      {!ready ? (
        <p className="py-8 text-center text-sm text-slate-500">読み込み中…</p>
      ) : labels.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600">
          ラベルがまだありません。上のフォームから追加できます。
        </p>
      ) : (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {labels.map((label) => (
            <LabelRow
              key={label.id}
              label={label}
              count={tasks.filter((t) => t.labelIds.includes(label.id)).length}
              validate={(v) => validate(v, label.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function LabelRow({
  label,
  count,
  validate,
}: {
  label: Label;
  count: number;
  validate: (value: string) => string;
}) {
  const [name, setName] = useState(label.name);
  const [color, setColor] = useState(label.color);
  const [error, setError] = useState("");
  const dirty = name !== label.name || color !== label.color;

  function save() {
    const message = validate(name);
    if (message) {
      setError(message);
      return;
    }
    updateLabel(label.id, name.trim(), color);
    setName(name.trim());
    setError("");
  }

  function remove() {
    const note = count > 0 ? `${count}件のタスクからこのラベルが外れます。` : "";
    if (window.confirm(`ラベル「${label.name}」を削除しますか？${note}`)) {
      deleteLabel(label.id);
    }
  }

  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          aria-label={`ラベル名（${label.name}）`}
          aria-invalid={Boolean(error)}
          className={`${input} min-w-0 flex-1`}
        />
        <ColorPicker value={color} onChange={setColor} />
        <span className="w-14 text-right text-xs text-slate-500">{count} 件</span>
        <button
          type="button"
          onClick={save}
          disabled={!dirty}
          className="h-9 rounded-md border border-slate-300 px-3 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          保存
        </button>
        <button
          type="button"
          onClick={remove}
          className="h-9 rounded-md px-3 text-sm text-red-600 hover:bg-red-50"
        >
          削除
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </li>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div role="radiogroup" aria-label="色" className="flex items-center gap-1">
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          aria-label={c}
          onClick={() => onChange(c)}
          className={`h-6 w-6 rounded-full ring-offset-1 ${
            value === c ? "ring-2 ring-slate-700" : "ring-1 ring-slate-200"
          }`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}
