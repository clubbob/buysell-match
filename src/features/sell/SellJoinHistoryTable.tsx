import { formatCount } from '@/lib/sell-display';
import { formatMemberJoinedAt } from '@/types/member';
import type { SellJoin } from '@/types/sell-join';

export default function SellJoinHistoryTable({
  joins,
  title = '구매 참여 내역',
}: {
  joins: SellJoin[];
  title?: string;
}) {
  return (
    <div className="w-full overflow-x-auto border border-line">
      <p className="border-b border-line bg-slate-50 px-3 py-2 text-center text-sm font-semibold text-ink">{title}</p>
      <table className="w-full min-w-[28rem] text-center text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] font-semibold text-subtle">
            <th className="px-3 py-2 font-semibold">구매자</th>
            <th className="px-3 py-2 font-semibold">수량</th>
            <th className="px-3 py-2 font-semibold">상태</th>
            <th className="px-3 py-2 font-semibold">참여일</th>
          </tr>
        </thead>
        <tbody>
          {joins.map((row) => (
            <tr key={row.id} className="border-t border-line">
              <td className="px-3 py-2.5 break-all text-ink">{row.buyerEmail || '—'}</td>
              <td className="px-3 py-2.5 font-semibold tabular-nums text-ink">{formatCount(row.quantity)}</td>
              <td className="px-3 py-2.5 font-semibold text-ink">
                {row.status === 'confirmed' ? '판매 확정' : '접수됨'}
              </td>
              <td className="px-3 py-2.5 font-semibold tabular-nums text-ink">
                {formatMemberJoinedAt(row.createdAt) || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
