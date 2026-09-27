'use client';

import { useMemo, useState } from 'react';
import type { SignupTrendPoint } from '@/lib/admin-dashboard';

const WIDTH = 720;
const HEIGHT = 260;
const PAD = { top: 24, right: 16, bottom: 36, left: 36 };

export default function SignupTrendChart({ points }: { points: SignupTrendPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...points.map((point) => point.count));
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const total = points.reduce((sum, point) => sum + point.count, 0);

  const coords = useMemo(
    () =>
      points.map((point, index) => {
        const x =
          PAD.left + (points.length <= 1 ? innerW / 2 : (index / (points.length - 1)) * innerW);
        const y = PAD.top + innerH - (point.count / max) * innerH;
        return { ...point, x, y };
      }),
    [innerH, innerW, max, points],
  );

  const line = coords.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
  const area = coords.length
    ? `${line} L${coords[coords.length - 1].x.toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${coords[0].x.toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`
    : '';
  const ticks = max <= 2 ? [0, max] : [0, Math.round(max / 2), max];
  const active = hover !== null ? coords[hover] : coords[coords.length - 1];
  const labelStep = points.length > 14 ? 4 : points.length > 8 ? 2 : 1;

  function indexFromClientX(clientX: number, target: SVGSVGElement) {
    const box = target.getBoundingClientRect();
    const x = ((clientX - box.left) / box.width) * WIDTH;
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    coords.forEach((point, index) => {
      const next = Math.abs(point.x - x);
      if (next < distance) {
        distance = next;
        nearest = index;
      }
    });
    return nearest;
  }

  return (
    <div className="relative">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-subtle">기간 합계</p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums text-ink">{total}명</p>
        </div>
        {active ? (
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink">{active.label}</span>
            <span className="mx-1.5 text-subtle">·</span>
            <span className="tabular-nums">{active.count}명 가입</span>
          </p>
        ) : null}
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-[220px] w-full overflow-visible sm:h-[260px]"
        role="img"
        aria-label="회원 가입 추세 그래프"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(event) => setHover(indexFromClientX(event.clientX, event.currentTarget))}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (touch) setHover(indexFromClientX(touch.clientX, event.currentTarget));
        }}
      >
        <defs>
          <linearGradient id="signup-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10233a" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#10233a" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {ticks.map((tick) => {
          const y = PAD.top + innerH - (tick / max) * innerH;
          return (
            <g key={tick}>
              <line x1={PAD.left} y1={y} x2={WIDTH - PAD.right} y2={y} stroke="#c5ced8" strokeDasharray="3 5" />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" className="fill-subtle" fontSize="11">
                {tick}
              </text>
            </g>
          );
        })}

        {area ? <path d={area} fill="url(#signup-fill)" /> : null}
        {line ? <path d={line} fill="none" stroke="#10233a" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" /> : null}

        {coords.map((point, index) =>
          index % labelStep === 0 || index === coords.length - 1 ? (
            <text key={point.date} x={point.x} y={HEIGHT - 10} textAnchor="middle" className="fill-subtle" fontSize="11">
              {point.label}
            </text>
          ) : null,
        )}

        {active ? (
          <>
            <line x1={active.x} y1={PAD.top} x2={active.x} y2={PAD.top + innerH} stroke="#10233a" strokeOpacity="0.2" />
            <circle cx={active.x} cy={active.y} r="5.5" fill="#10233a" />
            <circle cx={active.x} cy={active.y} r="2.5" fill="#ffffff" />
          </>
        ) : null}
      </svg>
    </div>
  );
}
