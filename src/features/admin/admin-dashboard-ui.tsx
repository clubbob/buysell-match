import Link from 'next/link';
import { type ReactNode } from 'react';
import type { StatTile, StatTone } from '@/features/mypage/mypage-status-board-ui';
import { cn } from '@/lib/utils';

export type AdminPanelTone = 'profile' | 'sell' | 'buy' | 'inquiry';

const PANEL_THEME: Record<
  AdminPanelTone,
  { surface: string; bar: string; title: string; link: string; dot: string }
> = {
  profile: {
    surface: 'bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/50',
    bar: 'bg-gradient-to-b from-indigo-400 to-violet-500',
    title: 'text-indigo-900',
    link: 'text-indigo-700',
    dot: 'bg-indigo-500',
  },
  sell: {
    surface: 'bg-gradient-to-br from-amber-50 via-[#fffbeb] to-amber-50/70',
    bar: 'bg-gradient-to-b from-amber-400 to-amber-600',
    title: 'text-amber-900',
    link: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  buy: {
    surface: 'bg-gradient-to-br from-sky-50 via-white to-sky-50/70',
    bar: 'bg-gradient-to-b from-sky-400 to-sky-600',
    title: 'text-sky-900',
    link: 'text-sky-800',
    dot: 'bg-sky-500',
  },
  inquiry: {
    surface: 'bg-gradient-to-br from-teal-50/90 via-white to-slate-50/60',
    bar: 'bg-gradient-to-b from-teal-400 to-teal-600',
    title: 'text-teal-900',
    link: 'text-teal-800',
    dot: 'bg-teal-500',
  },
};

const PRODUCT_TONE_CLASS: Partial<Record<StatTone, string>> = {
  neutral: 'border-amber-200/90 bg-gradient-to-b from-amber-50 to-white',
  info: 'border-amber-200/80 bg-gradient-to-b from-amber-50/95 to-white',
  muted: 'border-line bg-white',
};

const BUY_PRODUCT_TONE_CLASS: Partial<Record<StatTone, string>> = {
  neutral: 'border-sky-200/90 bg-gradient-to-b from-sky-50 to-white',
  info: 'border-cyan-200/80 bg-gradient-to-b from-cyan-50 to-white',
  muted: 'border-line bg-white',
};

const PROFILE_PRODUCT_TONE_CLASS: Partial<Record<StatTone, string>> = {
  neutral: 'border-indigo-200/90 bg-gradient-to-b from-indigo-50 to-white',
  info: 'border-violet-200/80 bg-gradient-to-b from-violet-50 to-white',
  muted: 'border-line bg-white',
};

const INQUIRY_PRODUCT_TONE_CLASS: Partial<Record<StatTone, string>> = {
  neutral: 'border-teal-200/90 bg-gradient-to-b from-teal-50 to-white',
  info: 'border-cyan-200/80 bg-gradient-to-b from-cyan-50 to-white',
  muted: 'border-line bg-white',
};

const PIPELINE_TONE_CLASS: Partial<Record<StatTone, string>> = {
  neutral: 'border-line bg-white',
  info: 'border-line bg-white',
  warn: 'border-orange-200 bg-orange-50/90',
  success: 'border-emerald-200 bg-emerald-50/90',
  muted: 'border-line bg-white',
};

const TONE_VALUE_CLASS: Record<StatTone, string> = {
  neutral: 'text-ink',
  info: 'text-ink',
  warn: 'text-orange-900',
  success: 'text-emerald-900',
  muted: 'text-muted',
};

function toneClassForGroup(tone: AdminPanelTone, variant: 'product' | 'pipeline') {
  if (variant === 'pipeline') return PIPELINE_TONE_CLASS;
  if (tone === 'sell') return PRODUCT_TONE_CLASS;
  if (tone === 'buy') return BUY_PRODUCT_TONE_CLASS;
  if (tone === 'profile') return PROFILE_PRODUCT_TONE_CLASS;
  return INQUIRY_PRODUCT_TONE_CLASS;
}

function AdminStatCard({
  tile,
  toneClass,
  size = 'product',
}: {
  tile: StatTile;
  toneClass: Partial<Record<StatTone, string>>;
  size?: 'product' | 'pipeline';
}) {
  const display = tile.value === null ? '—' : tile.value.toLocaleString('ko-KR');
  const surfaceClass = toneClass[tile.tone] ?? PIPELINE_TONE_CLASS.muted;
  const isProduct = size === 'product';

  return (
    <div
      className={cn(
        'rounded-md border shadow-[0_8px_20px_-14px_rgba(15,23,42,0.28)]',
        isProduct ? 'flex min-h-[5.25rem] flex-col justify-between px-3.5 py-3 sm:min-h-[5.75rem]' : 'px-3 py-2.5 sm:py-3',
        surfaceClass,
      )}
    >
      <p className="text-[11px] font-semibold leading-tight text-subtle">{tile.label}</p>
      <p
        className={cn(
          'font-sans font-bold tabular-nums leading-none',
          isProduct ? 'mt-3 text-2xl sm:text-[1.75rem]' : 'mt-2 text-xl sm:text-2xl',
          TONE_VALUE_CLASS[tile.tone],
        )}
      >
        {display}
        {tile.sub ? <span className="ml-1 text-xs font-semibold text-muted">{tile.sub}</span> : null}
      </p>
    </div>
  );
}

function AdminStatGroup({
  title,
  tiles,
  columns,
  tone,
  variant,
}: {
  title: string;
  tiles: StatTile[];
  columns: 3 | 4 | 6;
  tone: AdminPanelTone;
  variant: 'product' | 'pipeline';
}) {
  const colClass =
    columns === 6 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' : columns === 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-3';
  const toneClass = toneClassForGroup(tone, variant);

  return (
    <div>
      <p className="mb-2 text-xs font-bold text-subtle">{title}</p>
      <div className={cn('grid gap-2 sm:gap-2.5', colClass)}>
        {tiles.map((tile) => (
          <AdminStatCard key={tile.key} tile={tile} toneClass={toneClass} size={variant} />
        ))}
      </div>
    </div>
  );
}

export type AdminDashboardGroup = {
  title: string;
  tiles: StatTile[];
  columns: 3 | 4 | 6;
  variant: 'product' | 'pipeline';
};

export function AdminDashboardPanel({
  title,
  href,
  badge,
  tone,
  groups,
  footer,
}: {
  title: string;
  href: string;
  badge?: string | null;
  tone: AdminPanelTone;
  groups: AdminDashboardGroup[];
  footer?: ReactNode;
}) {
  const theme = PANEL_THEME[tone];

  return (
    <section className="panel overflow-hidden shadow-[0_10px_28px_-18px_rgba(15,23,42,0.2)]">
      <div className={cn('relative', theme.surface)}>
        <div className={cn('absolute inset-y-0 left-0 w-1', theme.bar)} aria-hidden />
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 pl-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('h-2 w-2 shrink-0 rounded-full', theme.dot)} aria-hidden />
              <h2 className={cn('text-sm font-bold sm:text-base', theme.title)}>{title}</h2>
              {badge ? (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                  {badge}
                </span>
              ) : null}
            </div>
            <Link href={href} className={cn('text-xs font-semibold underline-offset-2 hover:underline', theme.link)}>
              전체 보기 →
            </Link>
          </div>

          <div className="space-y-4 pl-2">
            {groups.map((group) => (
              <AdminStatGroup
                key={group.title}
                title={group.title}
                tiles={group.tiles}
                columns={group.columns}
                tone={tone}
                variant={group.variant}
              />
            ))}
            {footer}
          </div>
        </div>
      </div>
    </section>
  );
}
