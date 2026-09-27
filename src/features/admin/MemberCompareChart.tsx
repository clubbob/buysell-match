import type { SignupTrendPoint } from '@/lib/admin-dashboard';
import type { SparkTone } from '@/features/admin/Sparkline';

const WIDTH = 720;
const HEIGHT = 268;
const PAD = { top: 22, right: 18, bottom: 36, left: 40 };

function axisIndexes(length: number) {
  if (length <= 1) return [0];
  if (length <= 8) return Array.from({ length }, (_, index) => index);
  const marks = new Set([0, length - 1]);
  for (let step = 1; step < 4; step += 1) marks.add(Math.round(((length - 1) * step) / 4));
  return [...marks].sort((a, b) => a - b);
}

function yTicks(max: number) {
  if (max <= 1) return [0, 1];
  if (max <= 6) return Array.from({ length: max + 1 }, (_, index) => index);
  return [0, Math.round(max / 3), Math.round((max * 2) / 3), max];
}

function cumulative(points: SignupTrendPoint[], total: number) {
  const windowSum = points.reduce((sum, point) => sum + point.count, 0);
  let running = Math.max(0, total - windowSum);
  return points.map((point) => {
    running += point.count;
    return { ...point, count: running };
  });
}

function rate(part: number, whole: number) {
  if (whole <= 0) return '0%';
  return `${Math.round((part / whole) * 100)}%`;
}

function linePath(coords: { x: number; y: number }[]) {
  return coords.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
}

function Marker({
  kind,
  x,
  y,
  color,
}: {
  kind: 'circle' | 'square' | 'triangle';
  x: number;
  y: number;
  color: string;
}) {
  if (kind === 'square') {
    return <rect x={x - 4} y={y - 4} width="8" height="8" fill={color} stroke="#ffffff" strokeWidth="1.2" />;
  }
  if (kind === 'triangle') {
    return (
      <polygon
        points={`${x},${y - 5.5} ${x + 5.2},${y + 4.2} ${x - 5.2},${y + 4.2}`}
        fill={color}
        stroke="#ffffff"
        strokeWidth="1.2"
      />
    );
  }
  return (
    <>
      <circle cx={x} cy={y} r="4.4" fill={color} />
      <circle cx={x} cy={y} r="1.7" fill="#ffffff" />
    </>
  );
}

type SeriesDef = {
  key: string;
  label: string;
  points: SignupTrendPoint[];
  total: number;
  tone: SparkTone;
  dash?: string;
  marker: 'circle' | 'square' | 'triangle';
};

export default function MemberCompareChart({
  members,
  buyers,
  sellers,
  memberTotal,
  buyerTotal,
  sellerTotal,
  tones,
}: {
  members: SignupTrendPoint[];
  buyers: SignupTrendPoint[];
  sellers: SignupTrendPoint[];
  memberTotal: number;
  buyerTotal: number;
  sellerTotal: number;
  tones: { members: SparkTone; buyers: SparkTone; sellers: SparkTone };
}) {
  const series: SeriesDef[] = [
    {
      key: 'members',
      label: '가입 회원',
      points: cumulative(members, memberTotal),
      total: memberTotal,
      tone: tones.members,
      marker: 'circle',
    },
    {
      key: 'buyers',
      label: '구매자 등록',
      points: cumulative(buyers, buyerTotal),
      total: buyerTotal,
      tone: tones.buyers,
      dash: '7 5',
      marker: 'square',
    },
    {
      key: 'sellers',
      label: '판매자 등록',
      points: cumulative(sellers, sellerTotal),
      total: sellerTotal,
      tone: tones.sellers,
      dash: '2 5',
      marker: 'triangle',
    },
  ];
  const base = series[0].points.length ? series[0].points : [{ date: '0', label: '-', count: 0 }];
  const max = Math.max(1, ...series.flatMap((item) => item.points.map((point) => point.count)));
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const ticks = yTicks(max);
  const xMarks = axisIndexes(base.length);
  const groupW = base.length ? innerW / base.length : innerW;
  const barW = Math.max(4, Math.min(12, (groupW - 6) / series.length));
  const clusterW = barW * series.length;

  function barX(dayIndex: number, seriesIndex: number) {
    const center = PAD.left + groupW * dayIndex + groupW / 2;
    return center - clusterW / 2 + seriesIndex * barW;
  }

  function pointAt(item: SeriesDef, dayIndex: number) {
    const count = item.points[dayIndex]?.count ?? 0;
    return {
      x: barX(dayIndex, series.indexOf(item)) + barW / 2,
      y: PAD.top + innerH - (count / max) * innerH,
      count,
    };
  }

  return (
    <div>
      <div className="flex flex-wrap justify-end gap-x-5 gap-y-1 px-5 pt-3 text-sm">
        {series.map((item) => (
          <p key={item.key} className="tabular-nums" style={{ color: item.tone.stroke }}>
            <span className="font-semibold">{item.label}</span>
            <span className="mx-1.5 text-subtle">·</span>
            <span className="font-bold">{item.total}명</span>
              {item.key !== 'members' ? (
                <span className="ml-1.5 text-muted">({rate(item.total, buyerTotal + sellerTotal)})</span>
              ) : null}
          </p>
        ))}
      </div>
      <div className="px-3 py-3 sm:px-5">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-[15.5rem] w-full sm:h-[17.5rem]" role="img" aria-label="가입 회원">
          {ticks.map((tick) => {
            const y = PAD.top + innerH - (tick / max) * innerH;
            return (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={WIDTH - PAD.right}
                  y2={y}
                  stroke="#d6dee8"
                  strokeDasharray={tick === 0 ? undefined : '3 5'}
                />
                <text x={PAD.left - 10} y={y + 3.5} textAnchor="end" fill="#5b6b80" fontSize="11">
                  {tick}
                </text>
              </g>
            );
          })}

          {base.map((day, dayIndex) =>
            series.map((item, seriesIndex) => {
              const count = item.points[dayIndex]?.count ?? 0;
              const height = Math.max(count > 0 ? 5 : 0, (count / max) * innerH);
              return (
                <rect
                  key={`${item.key}-${day.date}`}
                  x={barX(dayIndex, seriesIndex)}
                  y={PAD.top + innerH - height}
                  width={barW}
                  height={height}
                  rx="1.4"
                  fill={item.tone.stroke}
                  fillOpacity={0.88 - seriesIndex * 0.08}
                />
              );
            }),
          )}

          {series.map((item) => {
            const plotted = base.map((_, dayIndex) => pointAt(item, dayIndex));
            return (
              <g key={`line-${item.key}`}>
                <path
                  d={linePath(plotted)}
                  fill="none"
                  stroke={item.tone.stroke}
                  strokeWidth="2.2"
                  strokeDasharray={item.dash}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {plotted.map((point, index) =>
                  xMarks.includes(index) || index === plotted.length - 1 ? (
                    <Marker key={`${item.key}-m-${index}`} kind={item.marker} x={point.x} y={point.y} color={item.tone.stroke} />
                  ) : null,
                )}
              </g>
            );
          })}

          {xMarks.map((index) => {
            const point = base[index];
            if (!point) return null;
            const x = PAD.left + groupW * index + groupW / 2;
            return (
              <text key={point.date} x={x} y={HEIGHT - 8} textAnchor="middle" fill="#5b6b80" fontSize="11">
                {point.label}
              </text>
            );
          })}
        </svg>
        <ul className="mt-1 flex flex-wrap gap-x-6 gap-y-2 px-2 text-sm text-ink">
          {series.map((item) => (
            <li key={item.key} className="flex items-center gap-2">
              <svg width="36" height="14" viewBox="0 0 36 14" aria-hidden>
                <line
                  x1="2"
                  y1="7"
                  x2="34"
                  y2="7"
                  stroke={item.tone.stroke}
                  strokeWidth="2.2"
                  strokeDasharray={item.dash}
                />
                <g transform="translate(18 7)">
                  {item.marker === 'circle' ? (
                    <circle r="3.4" fill={item.tone.stroke} />
                  ) : item.marker === 'square' ? (
                    <rect x="-3.2" y="-3.2" width="6.4" height="6.4" fill={item.tone.stroke} />
                  ) : (
                    <polygon points="0,-4 4,3.4 -4,3.4" fill={item.tone.stroke} />
                  )}
                </g>
              </svg>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
