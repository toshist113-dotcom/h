"use client";

import { useState } from "react";

type Props = {
  title: string;
  done: boolean;
  className?: string;
};

/**
 * 完了したタスクのタイトルをバイキンマンが消す。
 * 完了にした瞬間は左から右へ走って消すアニメーション、最初から完了の場合は消えた状態で表示する。
 * 文字は DOM に残っている（未完了に戻すと元に戻る。読み上げやツールチップでも読める）。
 */
export function ErasableTitle({ title, done, className = "" }: Props) {
  const [prevDone, setPrevDone] = useState(done);
  const [animate, setAnimate] = useState(false);
  if (prevDone !== done) {
    setPrevDone(done);
    setAnimate(done);
  }

  const state = done ? (animate ? "erase-anim" : "erase-static") : "";

  return (
    <span className={`relative inline-block max-w-full align-top ${state}`}>
      <span className={`break-words ${className}`}>{title}</span>
      {done && (
        <>
          <span aria-hidden className="erase-cover pointer-events-none" />
          <Baikin />
          {/* 消している最中だけ、バイキンマンから逃げるバタコさんとアンパンマン号 */}
          {animate && (
            <>
              <Batako />
              <AnpanGo />
            </>
          )}
        </>
      )}
    </span>
  );
}

function Batako() {
  return (
    <svg
      viewBox="0 0 24 40"
      aria-hidden
      className="chaser chaser-batako pointer-events-none absolute h-10 w-6"
    >
      <g className="chaser-bob">
        {/* 足 */}
        <g className="baikin-leg baikin-leg-r">
          <path d="M10 28 L9 36" stroke="#fcd9b6" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="8.5" cy="38" rx="3.2" ry="1.8" fill="#9a3412" />
        </g>
        <g className="baikin-leg baikin-leg-l">
          <path d="M14 28 L15 36" stroke="#fcd9b6" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="15.5" cy="38" rx="3.2" ry="1.8" fill="#9a3412" />
        </g>
        {/* ワンピース */}
        <path d="M7 19 L17 19 L19.5 30 L4.5 30 Z" fill="#f97316" />
        {/* びっくりして上げた両腕 */}
        <path d="M7.5 20 L3 14" stroke="#fcd9b6" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M16.5 20 L21 14" stroke="#fcd9b6" strokeWidth="2.6" strokeLinecap="round" />
        {/* 頭 */}
        <circle cx="12" cy="6" r="3.2" fill="#7c2d12" />
        <circle cx="12" cy="12" r="7" fill="#fde7cf" stroke="#d6a77a" strokeWidth="1" />
        <path d="M5.5 10 Q12 1 18.5 10 Q12 6.5 5.5 10 Z" fill="#7c2d12" />
        <circle cx="9.3" cy="12" r="1" fill="#1e293b" />
        <circle cx="14.7" cy="12" r="1" fill="#1e293b" />
        <circle cx="7.6" cy="14.4" r="1.3" fill="#fda4af" />
        <circle cx="16.4" cy="14.4" r="1.3" fill="#fda4af" />
        <ellipse cx="12" cy="15.7" rx="1.4" ry="1.8" fill="#9f1239" />
        {/* あせ */}
        <path d="M20 6 Q21.5 8.5 20 9.5 Q18.5 8.5 20 6 Z" fill="#7dd3fc" />
      </g>
    </svg>
  );
}

function AnpanGo() {
  return (
    <svg
      viewBox="0 0 48 28"
      aria-hidden
      className="chaser chaser-car pointer-events-none absolute h-7 w-12"
    >
      <g className="chaser-bob">
        {/* はしるときの線 */}
        <path d="M0 10 H5 M1 15 H5 M2 20 H5" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
        {/* 車体 */}
        <rect x="6" y="12" width="38" height="9" rx="3" fill="#dc2626" />
        <rect x="6" y="16" width="38" height="2" fill="#facc15" />
        <rect x="11" y="5.5" width="16" height="8" rx="2.5" fill="#dc2626" />
        <rect x="13" y="7" width="12" height="5" rx="1.5" fill="#bfdbfe" />
        {/* 前に付いた顔 */}
        <circle cx="38" cy="11" r="6.8" fill="#f5b461" stroke="#c2762b" strokeWidth="1" />
        <circle cx="35.8" cy="9.4" r="0.9" fill="#1e293b" />
        <circle cx="40.2" cy="9.4" r="0.9" fill="#1e293b" />
        <circle cx="38" cy="11.6" r="2" fill="#e11d48" />
        <path d="M35.2 14.2 Q38 16.2 40.8 14.2" fill="none" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
        {/* タイヤ */}
        <circle cx="15" cy="22.5" r="4" fill="#1e293b" />
        <circle cx="15" cy="22.5" r="1.6" fill="#facc15" />
        <circle cx="35" cy="22.5" r="4" fill="#1e293b" />
        <circle cx="35" cy="22.5" r="1.6" fill="#facc15" />
      </g>
    </svg>
  );
}

function Baikin() {
  return (
    <svg
      viewBox="0 0 32 46"
      aria-hidden
      className="baikin pointer-events-none absolute top-1/2 h-11 w-[30px] -translate-x-1/2 -translate-y-1/2"
    >
      {/* 足（走るときに交互に動く） */}
      <g className="baikin-leg baikin-leg-l">
        <path d="M13 36 L12 42" stroke="#4c1d95" strokeWidth="3.5" strokeLinecap="round" />
        <ellipse cx="11" cy="44" rx="4" ry="2" fill="#1e1b4b" />
      </g>
      <g className="baikin-leg baikin-leg-r">
        <path d="M19 36 L20 42" stroke="#4c1d95" strokeWidth="3.5" strokeLinecap="round" />
        <ellipse cx="21" cy="44" rx="4" ry="2" fill="#1e1b4b" />
      </g>

      {/* 体 */}
      <rect x="8.5" y="23" width="15" height="15" rx="6" fill="#4c1d95" />
      <ellipse cx="16" cy="31" rx="4.5" ry="5" fill="#7c3aed" />

      {/* 左うで */}
      <path d="M9.5 27 L3.5 32" stroke="#4c1d95" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="3.2" cy="32.3" r="2" fill="#ede9fe" />
      {/* 右うで（消しゴムを持つ） */}
      <path d="M22.5 27 L28 21" stroke="#4c1d95" strokeWidth="3.2" strokeLinecap="round" />
      <rect
        x="25.5"
        y="14.5"
        width="5.5"
        height="7"
        rx="1.2"
        fill="#f9a8d4"
        stroke="#be185d"
        strokeWidth="1"
        transform="rotate(20 28 18)"
      />

      {/* 頭 */}
      <g transform="translate(0 -3)">
        <path d="M7 11 L5 2 L13 7 Z" fill="#4c1d95" />
        <path d="M25 11 L27 2 L19 7 Z" fill="#4c1d95" />
        <circle cx="16" cy="18" r="12.5" fill="#6d28d9" stroke="#4c1d95" strokeWidth="1.5" />
        <circle cx="11" cy="15.5" r="3" fill="#fef08a" />
        <circle cx="21" cy="15.5" r="3" fill="#fef08a" />
        <circle cx="11.8" cy="16" r="1.3" fill="#1e1b4b" />
        <circle cx="21.8" cy="16" r="1.3" fill="#1e1b4b" />
        <path d="M7.5 11 L13.5 12.5" stroke="#1e1b4b" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M24.5 11 L18.5 12.5" stroke="#1e1b4b" strokeWidth="1.6" strokeLinecap="round" />
        <path
          d="M8 22 L11 25.5 L13.5 22 L16 25.5 L18.5 22 L21 25.5 L24 22 Z"
          fill="#ffffff"
          stroke="#1e1b4b"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
