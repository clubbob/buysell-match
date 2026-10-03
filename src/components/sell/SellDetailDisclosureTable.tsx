import type { SellDetailRow } from '@/lib/sell-product-detail';

export default function SellDetailDisclosureTable({ title, rows }: { title?: string; rows: SellDetailRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div>
      {title ? <h3 className="text-sm font-bold text-ink">{title}</h3> : null}
      <dl className={`overflow-hidden border border-line text-sm ${title ? 'mt-3' : 'mt-4'}`}>
        {rows.map((row, index) => (
          <div
            key={row.label}
            className={`grid grid-cols-1 sm:grid-cols-[9.5rem_minmax(0,1fr)] ${index > 0 ? 'border-t border-line' : ''}`}
          >
            <dt className="bg-slate-50 px-3 py-2.5 font-semibold text-ink sm:border-r sm:border-line">{row.label}</dt>
            <dd className="whitespace-pre-line px-3 py-2.5 leading-relaxed text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
