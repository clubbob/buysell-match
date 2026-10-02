import { formatDepositAccount, hasDepositAccount, joinPaymentDueNotice } from '@/lib/sell-display';
import type { SellListing } from '@/types/sell';

export default function DepositAccountNotice({
  item,
  confirmedAt,
  className = '',
}: {
  item: Pick<SellListing, 'depositBank' | 'depositAccount' | 'depositHolder'>;
  confirmedAt?: string;
  className?: string;
}) {
  if (!hasDepositAccount(item)) return null;
  const account = formatDepositAccount(item);

  return (
    <div className={`border border-line bg-slate-50 px-4 py-3 text-sm ${className}`}>
      <p className="font-semibold text-ink">입금 계좌</p>
      <p className="mt-1 text-ink">{account}</p>
      {confirmedAt ? (
        <p className="mt-2 text-xs font-semibold text-danger">{joinPaymentDueNotice(confirmedAt)}</p>
      ) : null}
    </div>
  );
}
