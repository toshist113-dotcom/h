/**
 * 画面の背景。空・雲・太陽（上）と、町とパン工場（下）。
 * 画面に固定して内容の後ろに置く。操作の邪魔にならないよう pointer-events なし。
 */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <Sky />
      <Town />
    </div>
  );
}

function Sky() {
  return (
    <svg
      viewBox="0 0 1200 200"
      preserveAspectRatio="xMidYMin slice"
      className="absolute inset-x-0 top-0 h-48 w-full"
    >
      {/* 太陽 */}
      <circle cx="1080" cy="80" r="52" fill="#fde047" opacity="0.35" />
      <circle cx="1080" cy="80" r="36" fill="#facc15" />
      {/* 雲 */}
      <g fill="#ffffff" opacity="0.95">
        <ellipse cx="170" cy="90" rx="60" ry="22" />
        <ellipse cx="215" cy="76" rx="44" ry="26" />
        <ellipse cx="135" cy="80" rx="36" ry="20" />
        <ellipse cx="620" cy="52" rx="56" ry="18" />
        <ellipse cx="660" cy="42" rx="38" ry="20" />
        <ellipse cx="880" cy="130" rx="50" ry="16" />
        <ellipse cx="915" cy="120" rx="34" ry="18" />
      </g>
    </svg>
  );
}

function House({
  x,
  w,
  h,
  body,
  roof,
}: {
  x: number;
  w: number;
  h: number;
  body: string;
  roof: string;
}) {
  const top = 335 - h;
  return (
    <g>
      <rect x={x} y={top} width={w} height={h} fill={body} stroke="#00000022" strokeWidth="2" />
      <path d={`M${x - 8} ${top} L${x + w / 2} ${top - w * 0.38} L${x + w + 8} ${top} Z`} fill={roof} />
      <rect x={x + w / 2 - 9} y={335 - 34} width="18" height="34" rx="3" fill="#92400e" />
      <rect x={x + 10} y={top + 14} width="16" height="16" rx="2" fill="#fef9c3" stroke="#00000022" />
      <rect x={x + w - 26} y={top + 14} width="16" height="16" rx="2" fill="#fef9c3" stroke="#00000022" />
    </g>
  );
}

function Tree({ x, s = 1 }: { x: number; s?: number }) {
  return (
    <g>
      <rect x={x - 4 * s} y={335 - 30 * s} width={8 * s} height={30 * s} fill="#92400e" />
      <circle cx={x} cy={335 - 44 * s} r={24 * s} fill="#4ade80" stroke="#16a34a" strokeWidth="2" />
    </g>
  );
}

function Town() {
  return (
    <svg
      viewBox="0 0 1200 360"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-x-0 bottom-0 h-[38vh] min-h-52 max-h-[420px] w-full"
    >
      {/* 丘 */}
      <path d="M0 300 Q200 220 420 290 T820 270 T1200 285 V360 H0 Z" fill="#a7e08f" />
      <path d="M0 325 Q300 280 600 318 T1200 310 V360 H0 Z" fill="#7ccf6a" />

      {/* 左の町 */}
      <Tree x={22} s={1.1} />
      <House x={50} w={90} h={85} body="#fde68a" roof="#ef4444" />
      <House x={160} w={70} h={108} body="#fbcfe8" roof="#3b82f6" />
      <House x={248} w={84} h={76} body="#bfdbfe" roof="#f59e0b" />
      <Tree x={360} />

      {/* パン工場 */}
      <g>
        {/* えんとつと湯気 */}
        <rect x="712" y="140" width="28" height="100" fill="#b45309" stroke="#78350f" strokeWidth="2" />
        <rect x="712" y="152" width="28" height="9" fill="#fde68a" />
        <g fill="#ffffff" opacity="0.9">
          <circle cx="726" cy="124" r="14" />
          <circle cx="742" cy="104" r="18" />
          <circle cx="764" cy="82" r="22" />
        </g>
        {/* 建物 */}
        <rect x="500" y="225" width="250" height="110" fill="#fff1d6" stroke="#d9a45b" strokeWidth="3" />
        {/* パンの形の屋根 */}
        <path d="M485 230 Q625 118 765 230 Z" fill="#e8a85a" stroke="#b9772e" strokeWidth="3" />
        <path d="M540 205 Q580 170 612 160" fill="none" stroke="#f6c985" strokeWidth="5" strokeLinecap="round" />
        <path d="M640 160 Q675 170 706 205" fill="none" stroke="#f6c985" strokeWidth="5" strokeLinecap="round" />
        {/* 屋根のあんぱん顔 */}
        <circle cx="625" cy="196" r="22" fill="#f5b461" stroke="#c2762b" strokeWidth="2" />
        <circle cx="617" cy="190" r="2.4" fill="#1e293b" />
        <circle cx="633" cy="190" r="2.4" fill="#1e293b" />
        <circle cx="625" cy="198" r="5.5" fill="#e11d48" />
        <path d="M615 206 Q625 214 635 206" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
        {/* 看板 */}
        <rect x="555" y="238" width="140" height="30" rx="6" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
        <text
          x="625"
          y="260"
          textAnchor="middle"
          fontSize="20"
          fontWeight="700"
          fill="#ffffff"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          パン工場
        </text>
        {/* 入口と窓 */}
        <path d="M595 335 V302 Q625 272 655 302 V335 Z" fill="#92400e" />
        <circle cx="535" cy="292" r="13" fill="#fde68a" stroke="#b9772e" strokeWidth="2" />
        <circle cx="715" cy="292" r="13" fill="#fde68a" stroke="#b9772e" strokeWidth="2" />
      </g>

      {/* 右の町 */}
      <Tree x={800} s={1.2} />
      <House x={840} w={86} h={92} body="#fecaca" roof="#16a34a" />
      <House x={948} w={72} h={72} body="#fef08a" roof="#8b5cf6" />
      <House x={1040} w={96} h={100} body="#c7f9cc" roof="#ef4444" />
      <Tree x={1170} />

      {/* 道 */}
      <rect x="0" y="335" width="1200" height="25" fill="#e5d3a8" />
      <path d="M0 348 H1200" stroke="#ffffff" strokeWidth="3" strokeDasharray="26 22" />
    </svg>
  );
}
