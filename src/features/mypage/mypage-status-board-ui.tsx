import Link from 'next/link';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type StatTone = 'neutral' | 'info' | 'warn' | 'success' | 'muted';

export type StatTile = {
  key: string;
  label: string;
  value: number | null;
  sub?: string;
  tone: StatTone;
};

export type DashboardSectionTone = 'member' | 'profile' | 'sell' | 'buy' | 'inquiry';

const TONE_CLASS: Record<StatTone, string> = {
  neutral: 'border-line bg-gradient-to-b from-slate-50 to-white',
  info: 'border-sky-200/80 bg-gradient-to-b from-sky-50 to-white',
  warn: 'border-orange-300/90 bg-gradient-to-b from-orange-50 to-white ring-1 ring-orange-200/50',
  success: 'border-emerald-200/80 bg-gradient-to-b from-emerald-50 to-white',
  muted: 'border-line bg-white',
};

const TONE_VALUE_CLASS: Record<StatTone, string> = {
  neutral: 'text-ink',
  info: 'text-sky-900',
  warn: 'text-orange-900',
  success: 'text-emerald-900',
  muted: 'text-muted',
};

export const SELL_TONE_CLASS: Partial<Record<StatTone, string>> = {
  neutral: 'border-amber-200/80 bg-gradient-to-b from-amber-50 to-white',
  info: 'border-amber-200/70 bg-gradient-to-b from-amber-50/90 to-white',
  muted: 'border-line bg-gradient-to-b from-slate-50 to-white',
};

export const BUY_TONE_CLASS: Partial<Record<StatTone, string>> = {
  neutral: 'border-sky-200/80 bg-gradient-to-b from-sky-50 to-white',
  info: 'border-cyan-200/80 bg-gradient-to-b from-cyan-50 to-white',
  muted: 'border-line bg-gradient-to-b from-slate-50 to-white',
};

export const SITE_INQUIRY_TONE_CLASS: Partial<Record<StatTone, string>> = {
  neutral: 'border-teal-200/80 bg-gradient-to-b from-teal-50 to-white',
  info: 'border-cyan-200/80 bg-gradient-to-b from-cyan-50 to-white',
  muted: 'border-line bg-gradient-to-b from-slate-50 to-white',
};

export const SELL_INQUIRY_TONE_CLASS: Partial<Record<StatTone, string>> = {
  neutral: 'border-slate-300/80 bg-gradient-to-b from-slate-100 to-white',
  info: 'border-slate-300/80 bg-gradient-to-b from-slate-50 to-white',
  muted: 'border-line bg-gradient-to-b from-slate-50 to-white',
};

const SECTION_TONE: Record<
  DashboardSectionTone,
  { bar: string; surface: string; title: string; link: string; dot: string }
> = {
  member: {
    bar: 'bg-gradient-to-b from-violet-500 to-indigo-600',
    surface: 'bg-gradient-to-r from-violet-50/95 via-white to-indigo-50/70',
    title: 'text-violet-900',
    link: 'text-violet-700',
    dot: 'bg-violet-500',
  },
  profile: {
    bar: 'bg-gradient-to-b from-indigo-400 to-violet-500',
    surface: 'bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/50',
    title: 'text-indigo-900',
    link: 'text-indigo-700',
    dot: 'bg-indigo-500',
  },
  sell: {
    bar: 'bg-gradient-to-b from-amber-400 to-amber-600',
    surface: 'bg-gradient-to-r from-amber-50/90 via-white to-amber-50/40',
    title: 'text-amber-900',
    link: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  buy: {
    bar: 'bg-gradient-to-b from-sky-400 to-sky-600',
    surface: 'bg-gradient-to-r from-sky-50/90 via-white to-sky-50/40',
    title: 'text-sky-900',
    link: 'text-sky-800',
    dot: 'bg-sky-500',
  },
  inquiry: {
    bar: 'bg-gradient-to-b from-teal-400 to-teal-600',
    surface: 'bg-gradient-to-r from-teal-50/90 via-white to-slate-50/50',
    title: 'text-teal-900',
    link: 'text-teal-800',
    dot: 'bg-teal-500',
  },
};

export function StatCell({ tile, toneClass }: { tile: StatTile; toneClass?: Partial<Record<StatTone, string>> }) {
  const display = tile.value === null ? '—' : tile.value.toLocaleString('ko-KR');
  const surfaceClass = toneClass?.[tile.tone] ?? TONE_CLASS[tile.tone];
  const highlighted = tile.value !== null && tile.value > 0 && (tile.tone === 'warn' || tile.tone === 'success');

  return (
    <div
      className={cn(
        'rounded-sm border px-2.5 py-2 shadow-[0_6px_16px_-12px_rgba(15,23,42,0.35)]',
        surfaceClass,
        highlighted && tile.tone === 'warn' ? 'shadow-[0_8px_20px_-10px_rgba(234,88,12,0.35)]' : null,
        highlighted && tile.tone === 'success' ? 'shadow-[0_8px_20px_-10px_rgba(16,185,129,0.3)]' : null,
      )}
    >
      <p className="text-[10px] font-semibold leading-tight text-subtle">{tile.label}</p>
      <p className={cn('mt-1 font-sans text-lg font-bold tabular-nums leading-none', TONE_VALUE_CLASS[tile.tone])}>
        {display}
        {tile.sub ? <span className="ml-0.5 text-[10px] font-semibold text-muted">{tile.sub}</span> : null}
      </p>
    </div>
  );
}

export function skeletonTile(key: string, label: string, sub = '건'): StatTile {
  return { key, label, value: null, sub, tone: 'muted' };
}

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <section
      className="panel overflow-hidden divide-y divide-line border-t-[3px] border-violet-300 shadow-[0_12px_32px_-20px_rgba(79,70,229,0.28)]"
    >
      {children}
    </section>
  );
}

export function DashboardMemberStrip({
  displayName,
  email,
  joinedAt,
  initial,
}: {
  displayName: string;
  email: string;
  joinedAt: string | null;
  initial: string;
}) {
  const tone = SECTION_TONE.member;

  return (
    <div className={cn('relative px-4 py-3 sm:px-5', tone.surface)}>
      <div className={cn('absolute inset-y-0 left-0 w-1', tone.bar)} aria-hidden />
      <div className="flex min-w-0 items-center gap-3 pl-2">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(79,70,229,0.65)]"
          aria-hidden
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-violet-700">내 활동 요약</p>
          <p className="truncate text-sm font-bold text-ink">{displayName || '회원'}</p>
          <p className="truncate text-xs text-muted">
            {[email || '—', joinedAt ? `가입 ${joinedAt}` : null].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>
    </div>
  );
}

export function DashboardSection({
  title,
  badge,
  href,
  tone = 'profile',
  children,
}: {
  title: string;
  badge?: string | null;
  href?: string;
  tone?: DashboardSectionTone;
  children: ReactNode;
}) {
  const palette = SECTION_TONE[tone];

  return (
    <div className={cn('relative', palette.surface)}>
      <div className={cn('absolute inset-y-0 left-0 w-1', palette.bar)} aria-hidden />
      <div className="px-4 py-3 sm:px-5 sm:py-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 pl-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('h-2 w-2 shrink-0 rounded-full', palette.dot)} aria-hidden />
            <h2 className={cn('text-sm font-bold', palette.title)}>{title}</h2>
            {badge ? (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800 shadow-sm">
                {badge}
              </span>
            ) : null}
          </div>
          {href ? (
            <Link
              href={href}
              className={cn('text-xs font-semibold underline-offset-2 hover:underline', palette.link)}
            >
              전체 보기 →
            </Link>
          ) : null}
        </div>
        <div className="pl-2">{children}</div>
      </div>
    </div>
  );
}

export function DashboardBlock({
  title,
  href,
  tone,
  children,
}: {
  title: string;
  href?: string;
  tone?: DashboardSectionTone;
  children: ReactNode;
}) {
  const linkClass = tone ? SECTION_TONE[tone].link : 'text-ink';

  return (
    <div className="rounded-md border border-white/80 bg-white/55 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-[1px]">
      <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
        <h3 className="text-[11px] font-bold text-subtle">{title}</h3>
        {href ? (
          <Link href={href} className={cn('text-[11px] font-semibold underline-offset-2 hover:underline', linkClass)}>
            보기 →
          </Link>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function StatGrid({
  tiles,
  columns = 3,
  toneClass,
}: {
  tiles: StatTile[];
  columns?: 2 | 3 | 4 | 6;
  toneClass?: Partial<Record<StatTone, string>>;
}) {
  const colClass =
    columns === 6
      ? 'grid-cols-3 sm:grid-cols-6'
      : columns === 4
        ? 'grid-cols-2 sm:grid-cols-4'
        : columns === 2
          ? 'grid-cols-2'
          : 'grid-cols-3';

  return (
    <div className={cn('grid gap-1.5 sm:gap-2', colClass)}>
      {tiles.map((tile) => (
        <StatCell key={tile.key} tile={tile} toneClass={toneClass} />
      ))}
    </div>
  );
}

export function ProfileStatCell({
  label,
  title,
  registered,
  href,
  variant,
}: {
  label: string;
  title: string;
  registered: boolean;
  href: string;
  variant: 'buyer' | 'seller';
}) {
  const isBuyer = variant === 'buyer';

  return (
    <Link
      href={href}
      className={cn(
        'group flex items-start gap-2.5 rounded-md border px-2.5 py-2.5 shadow-[0_6px_16px_-12px_rgba(15,23,42,0.3)] transition-shadow hover:shadow-[0_10px_22px_-12px_rgba(15,23,42,0.35)]',
        isBuyer
          ? registered
            ? 'mypage-dash-card--profile-buyer border-sky-200 bg-gradient-to-br from-sky-50 to-white'
            : 'border-sky-100 bg-gradient-to-br from-sky-50/50 to-white'
          : registered
            ? 'mypage-dash-card--profile-seller border-amber-200 bg-gradient-to-br from-amber-50 to-white'
            : 'border-amber-100 bg-gradient-to-br from-amber-50/50 to-white',
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm',
          isBuyer ? 'bg-gradient-to-br from-sky-500 to-sky-700' : 'bg-gradient-to-br from-amber-500 to-amber-700',
        )}
        aria-hidden
      >
        {isBuyer ? '구' : '판'}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('text-[10px] font-semibold', isBuyer ? 'text-sky-700' : 'text-amber-800')}>{label}</p>
        <p className={cn('mt-0.5 text-sm font-bold', registered ? 'text-emerald-800' : 'text-ink')}>
          {registered ? '완료' : '미등록'}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-muted group-hover:text-ink">{title}</p>
      </div>
    </Link>
  );
}
