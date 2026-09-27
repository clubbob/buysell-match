import type { SignupTrendPoint } from '@/lib/admin-dashboard';

export type SparkTone = {
  id: string;
  stroke: string;
  fill: string;
  bar: string;
  grid: string;
};

const WIDTH = 560;
const HEIGHT = 200;
const PAD = { top: 22, right: 14, bottom: 38, left: 32 };

function weekday(date: string) {
  const parsed = new Date(`${date}T00:00:00+09:00`);
  if (Number.isNaN(parsed.getTime())) return '';
  return ['일', '월', '화', '수', '목', '금', '토'][parsed.getDay()] ?? '';
}

function yTicks(max: number) {
  if (max <= 1) return [0, 1];
  if (max <= 8) return Array.from({ length: max + 1 }, (_, index) => index);
  const step = Math.ceil(max / 4);
  const ticks = [0];
  for (let value = step; value < max; value += step) ticks.push(value);
  ticks.push(max);
  return ticks;
}

export default function Sparkline({ points, tone }: { points: SignupTrendPoint[]; tone: SparkTone }) {
  const series = points.length > 0 ? points : [{ date: '0', label: '-', count: 0 }];
  const max = Math.max(1, ...series.map((point) => point.count));
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const slot = series.length > 0 ? innerW / series.length : innerW;
  const barW = Math.max(6, Math.min(18, slot * 0.58));
  const coords = series.map((point, index) => {
    const x = PAD.left + slot * index + slot / 2;
    const y = PAD.top + innerH - (point.count / max) * innerH;
    return { ...point, x, y, week: weekday(point.date) };
  });
  const line = coords.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
  const area = coords.length
    ? `${line} L${coords[coords.length - 1].x.toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${coords[0].x.toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`
    : '';
  const fillId = `spark-fill-${tone.id}`;
  const ticks = yTicks(max);
  const labelEvery = series.length > 20 ? 3 : series.length > 16 ? 2 : 1;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mt-4 h-[13.5rem] w-full sm:h-[15rem]" role="img" aria-label="추세">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone.fill} stopOpacity="0.42" />
          <stop offset="100%" stopColor={tone.fill} stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {ticks.map((tick) => {
        const y = PAD.top + innerH - (tick / max) * innerH;
        return (
          <g key={tick}>
            <line
              x1={PAD.left}
              y1={y}
              x2={WIDTH - PAD.right}
              y2={y}
              stroke={tone.grid}
              strokeDasharray={tick === 0 ? undefined : '3 5'}
            />
            <text x={PAD.left - 8} y={y + 3.5} textAnchor="end" fill={tone.stroke} fillOpacity="0.55" fontSize="11">
              {tick}
            </text>
          </g>
        );
      })}

      {coords.map((point) => {
        const barH = Math.max(point.count > 0 ? 6 : 0, (point.count / max) * innerH);
        return (
          <rect
            key={`bar-${point.date}`}
            x={point.x - barW / 2}
            y={PAD.top + innerH - barH}
            width={barW}
            height={barH}
            rx="2"
            fill={tone.bar}
            fillOpacity={point.count > 0 ? 0.45 : 0.1}
          />
        );
      })}

      {area ? <path d={area} fill={`url(#${fillId})`} /> : null}
      {line ? (
        <path d={line} fill="none" stroke={tone.stroke} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      ) : null}

      {coords.map((point, index) =>
        index % labelEvery === 0 || index === coords.length - 1 ? (
          <g key={`axis-${point.date}`}>
            <text x={point.x} y={HEIGHT - 18} textAnchor="middle" fill={tone.stroke} fillOpacity="0.62" fontSize="10">
              {point.label}
            </text>
            <text x={point.x} y={HEIGHT - 5} textAnchor="middle" fill={tone.stroke} fillOpacity="0.45" fontSize="9">
              {point.week}
            </text>
          </g>
        ) : null,
      )}

      {coords
        .filter((point) => point.count > 0)
        .map((point) => (
          <g key={`val-${point.date}`}>
            <circle cx={point.x} cy={point.y} r="3.4" fill={tone.stroke} />
            <circle cx={point.x} cy={point.y} r="1.6" fill="#ffffff" />
            <text
              x={point.x}
              y={point.y - 8}
              textAnchor="middle"
              fill={tone.stroke}
              fontSize="11"
              fontWeight="700"
            >
              {point.count}
            </text>
          </g>
        ))}
    </svg>
  );
}
