type Props = {
  checked: boolean;
  onChange: () => void;
  "aria-label": string;
};

/**
 * 顔の形のチェックボックス。未チェックはグレーの線画、チェックすると色が付く。
 * 実体は本物の checkbox（画面外）なので、キーボード操作とスクリーンリーダーはそのまま使える。
 */
export function AnpanCheck({ checked, onChange, "aria-label": ariaLabel }: Props) {
  const face = checked ? "#f5b461" : "#ffffff";
  const line = checked ? "#c2762b" : "#cbd5e1";
  const nose = checked ? "#e11d48" : "#e2e8f0";
  const cheek = checked ? "#fb7185" : "#e2e8f0";
  const ink = checked ? "#1e293b" : "#cbd5e1";

  return (
    <label className="relative mt-0.5 inline-flex shrink-0 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={ariaLabel}
        className="peer sr-only"
      />
      <svg
        viewBox="0 0 32 32"
        aria-hidden
        className={`h-8 w-8 rounded-full transition-transform duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-400 peer-focus-visible:ring-offset-1 ${
          checked ? "scale-110" : "hover:scale-105"
        }`}
      >
        <circle cx="16" cy="16" r="14" fill={face} stroke={line} strokeWidth="2" />
        <circle cx="10.5" cy="13" r="1.8" fill={ink} />
        <circle cx="21.5" cy="13" r="1.8" fill={ink} />
        <circle cx="7.5" cy="19" r="2.4" fill={cheek} opacity={checked ? 0.85 : 1} />
        <circle cx="24.5" cy="19" r="2.4" fill={cheek} opacity={checked ? 0.85 : 1} />
        <circle cx="16" cy="17" r="3.4" fill={nose} />
        <path
          d="M10.5 22.5 Q16 27 21.5 22.5"
          fill="none"
          stroke={ink}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </label>
  );
}
