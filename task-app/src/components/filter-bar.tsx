"use client";

import {
  EMPTY_FILTERS,
  SORT_LABELS,
  hasActiveFilters,
  type Filters,
  type SortKey,
} from "@/lib/tasks";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  type Label,
  type Priority,
  type Status,
} from "@/types/task";

const control =
  "h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

type Props = {
  filters: Filters;
  onChange: (next: Filters) => void;
  labels: Label[];
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  /** カンバン表示では並べ替えは使えない（列内は手動の並び順） */
  showSort: boolean;
};

export function FilterBar({ filters, onChange, labels, sort, onSortChange, showSort }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
      <input
        type="search"
        value={filters.q}
        onChange={(e) => set("q", e.target.value)}
        placeholder="タイトル・説明を検索"
        aria-label="キーワード検索"
        className={`${control} col-span-2 sm:w-64`}
      />
      <select
        aria-label="ステータスで絞り込み"
        value={filters.status}
        onChange={(e) => set("status", e.target.value as Status | "")}
        className={control}
      >
        <option value="">すべてのステータス</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <select
        aria-label="優先度で絞り込み"
        value={filters.priority}
        onChange={(e) => set("priority", e.target.value as Priority | "")}
        className={control}
      >
        <option value="">すべての優先度</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            優先度 {PRIORITY_LABELS[p]}
          </option>
        ))}
      </select>
      <select
        aria-label="ラベルで絞り込み"
        value={filters.labelId}
        onChange={(e) => set("labelId", e.target.value)}
        className={control}
      >
        <option value="">すべてのラベル</option>
        {labels.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>
      {showSort && (
        <select
          aria-label="並べ替え"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          className={control}
        >
          {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
            <option key={k} value={k}>
              {SORT_LABELS[k]}
            </option>
          ))}
        </select>
      )}
      {hasActiveFilters(filters) && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="h-9 rounded-md px-2 text-sm text-indigo-700 hover:bg-indigo-50"
        >
          絞り込みを解除
        </button>
      )}
    </div>
  );
}
