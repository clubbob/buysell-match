import type { ReactNode } from 'react';

const SELLER_ACCENT = '#d97706';
const BUYER_ACCENT = '#0284c7';

function GuideArtSellerSignup() {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full text-amber-950/75" aria-hidden>
      <line x1="18" y1="102" x2="182" y2="102" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" />
      <rect x="86" y="38" width="90" height="64" rx="3" fill="currentColor" fillOpacity="0.08" />
      <path d="M80 38h102l-8-14H88z" fill="currentColor" fillOpacity="0.18" />
      <path d="M80 38h102" stroke="currentColor" strokeWidth="2" />
      <rect x="80" y="24" width="10" height="14" fill="currentColor" fillOpacity="0.22" />
      <rect x="94" y="24" width="10" height="14" fill="currentColor" fillOpacity="0.1" />
      <rect x="108" y="24" width="10" height="14" fill="currentColor" fillOpacity="0.22" />
      <rect x="122" y="24" width="10" height="14" fill="currentColor" fillOpacity="0.1" />
      <rect x="136" y="24" width="10" height="14" fill="currentColor" fillOpacity="0.22" />
      <rect x="150" y="24" width="10" height="14" fill="currentColor" fillOpacity="0.1" />
      <rect x="164" y="24" width="10" height="14" fill="currentColor" fillOpacity="0.22" />
      <rect x="100" y="48" width="28" height="20" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M100 58h28M114 48v20" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.55" />
      <rect x="140" y="62" width="20" height="40" rx="1.5" fill="currentColor" fillOpacity="0.16" />
      <circle cx="156" cy="84" r="1.4" fill="currentColor" />
      <g className="seller-guide-person">
        <circle cx="42" cy="62" r="8" fill="currentColor" />
        <path d="M28 102c1.5-18 7-28 14-28s12.5 10 14 28" fill="currentColor" fillOpacity="0.85" />
      </g>
      <g className="seller-guide-stamp">
        <circle cx="168" cy="34" r="16" fill={SELLER_ACCENT} />
        <path d="M160.5 34.2 166 39.5l10-12" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function GuideArtSellerListing() {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full text-amber-950/75" aria-hidden>
      <line x1="18" y1="102" x2="182" y2="102" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" />
      <g className="seller-guide-spark seller-guide-spark-a">
        <path d="M36 28l1.4 3.4 3.6.8-2.8 2.3.8 3.6-3-1.9-3 1.9.8-3.6-2.8-2.3 3.6-.8z" fill={SELLER_ACCENT} />
      </g>
      <g className="seller-guide-spark seller-guide-spark-b">
        <path d="M168 22l1.1 2.6 2.7.6-2.1 1.7.6 2.7-2.3-1.4-2.3 1.4.6-2.7-2.1-1.7 2.7-.6z" fill={SELLER_ACCENT} />
      </g>
      <g className="seller-guide-lid">
        <path d="M64 48 100 32l50 16-36 16z" fill="currentColor" fillOpacity="0.22" />
        <path d="M64 48 100 32l50 16-36 16z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </g>
      <path d="M64 50v34l36 16 50-16V50L100 66z" fill="currentColor" fillOpacity="0.1" />
      <path d="M64 50 100 66l50-16M100 66v34" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M64 50v34l36 16 50-16V50" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <g className="seller-guide-tag">
        <path d="M138 38c8-10 22-8 26 2 3.2 8-2 16-12 18" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <rect x="148" y="54" width="34" height="22" rx="3" transform="rotate(-12 165 65)" fill={SELLER_ACCENT} />
        <path d="M154 62h18M154 68h12" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" transform="rotate(-12 165 65)" />
      </g>
    </svg>
  );
}

function GuideArtSellerManage() {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full text-amber-950/75" aria-hidden>
      <line x1="18" y1="102" x2="182" y2="102" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" />
      <rect x="42" y="22" width="78" height="80" rx="4" fill="currentColor" fillOpacity="0.08" />
      <rect x="42" y="22" width="78" height="80" rx="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="68" y="16" width="26" height="12" rx="3" fill={SELLER_ACCENT} />
      <g className="seller-guide-row seller-guide-row-a">
        <circle cx="62" cy="46" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path className="seller-guide-check" stroke={SELLER_ACCENT} d="M58 46.2 61.1 49.2 67.2 42.6" />
        <rect x="76" y="43" width="32" height="6" rx="1.5" fill="currentColor" fillOpacity="0.2" />
      </g>
      <g className="seller-guide-row seller-guide-row-b">
        <circle cx="62" cy="66" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path className="seller-guide-check" stroke={SELLER_ACCENT} d="M58 66.2 61.1 69.2 67.2 62.6" />
        <rect x="76" y="63" width="28" height="6" rx="1.5" fill="currentColor" fillOpacity="0.2" />
      </g>
      <g className="seller-guide-row seller-guide-row-c">
        <circle cx="62" cy="86" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path className="seller-guide-check" stroke={SELLER_ACCENT} d="M58 86.2 61.1 89.2 67.2 82.6" />
        <rect x="76" y="83" width="24" height="6" rx="1.5" fill="currentColor" fillOpacity="0.2" />
      </g>
      <g className="seller-guide-pack">
        <path d="M142 70h36l-6 24h-36z" fill="currentColor" fillOpacity="0.12" />
        <path d="M142 70h36v4h-36z" fill="currentColor" fillOpacity="0.22" />
        <path d="M142 70h36l-6 24h-36z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M160 70v24" stroke="currentColor" strokeWidth="1.3" />
        <path d="M154 58h12l4 12h-20z" fill="currentColor" fillOpacity="0.16" />
        <path d="M154 58h12l4 12h-20z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function GuideArtBuyerSignup() {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full text-sky-950/75" aria-hidden>
      <line x1="18" y1="102" x2="182" y2="102" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" />
      <path d="M84 46 126 18l42 28" fill="currentColor" fillOpacity="0.16" />
      <path d="M84 46 126 18l42 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="92" y="46" width="68" height="56" fill="currentColor" fillOpacity="0.08" />
      <rect x="92" y="46" width="68" height="56" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="104" y="56" width="20" height="16" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M104 64h20M114 56v16" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.5" />
      <rect x="132" y="70" width="18" height="32" rx="1.5" fill="currentColor" fillOpacity="0.16" />
      <circle cx="146" cy="88" r="1.3" fill="currentColor" />
      <g className="seller-guide-person">
        <circle cx="40" cy="62" r="8" fill="currentColor" />
        <path d="M26 102c1.5-18 7-28 14-28s12.5 10 14 28" fill="currentColor" fillOpacity="0.85" />
      </g>
      <g className="buyer-guide-pin">
        <path d="M126 8c7.2 0 13 5.6 13 12.6 0 9.2-13 22.4-13 22.4S113 29.8 113 20.6C113 13.6 118.8 8 126 8Z" fill={BUYER_ACCENT} />
        <circle cx="126" cy="20.2" r="4.2" fill="#fff" />
      </g>
    </svg>
  );
}

function GuideArtBuyerJoin() {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full text-sky-950/75" aria-hidden>
      <line x1="18" y1="102" x2="182" y2="102" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" />
      <g className="seller-guide-spark seller-guide-spark-a">
        <path d="M42 24l1.3 3.2 3.4.7-2.6 2.1.7 3.3-2.8-1.7-2.8 1.7.7-3.3-2.6-2.1 3.4-.7z" fill={BUYER_ACCENT} />
      </g>
      <g className="buyer-guide-item">
        <rect x="86" y="18" width="34" height="28" rx="3" fill="currentColor" fillOpacity="0.12" />
        <rect x="86" y="18" width="34" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M94 28h18M94 34h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <path d="M58 58h84l-8 32H70z" fill="currentColor" fillOpacity="0.08" />
      <path d="M58 58h84l-8 32H70z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M58 58 70 90M142 58 134 90" stroke="currentColor" strokeWidth="1.4" />
      <path d="M68 58c4-14 20-22 32-22s28 8 32 22" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <g className="buyer-guide-qty">
        <circle cx="158" cy="40" r="18" fill={BUYER_ACCENT} />
        <path d="M151 40h14M158 33v14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function GuideArtBuyerWanted() {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full text-sky-950/75" aria-hidden>
      <line x1="18" y1="102" x2="182" y2="102" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" />
      <rect x="32" y="20" width="96" height="82" rx="4" fill="currentColor" fillOpacity="0.08" />
      <rect x="32" y="20" width="96" height="82" rx="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="32" y="20" width="96" height="14" rx="4" fill="currentColor" fillOpacity="0.16" />
      <rect x="44" y="44" width="72" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M52 53h40" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <rect x="44" y="68" width="56" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M52 77h28" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <g className="buyer-guide-arrive">
        <rect x="142" y="48" width="40" height="46" rx="3" fill="currentColor" fillOpacity="0.1" />
        <rect x="142" y="48" width="40" height="46" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M150 60h24M150 68h16M150 76h20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </g>
      <g className="buyer-guide-qty">
        <circle cx="158" cy="30" r="16" fill={BUYER_ACCENT} />
        <path d="M151 30h14M158 23v14" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />
      </g>
    </svg>
  );
}

type GuideCard = {
  step: string;
  title: string;
  body: string;
  art: ReactNode;
};

const SELLER_CARDS: GuideCard[] = [
  {
    step: '01',
    title: '가입·역할',
    body: '이메일로 가입합니다. 로그인 후 판매자 모드를 고르고, 사업자 정보를 등록합니다.',
    art: <GuideArtSellerSignup />,
  },
  {
    step: '02',
    title: '팝니다 등록',
    body: '상품, 가격, 공동구매 수량, 마감, 결제·배송을 올려 구매자를 모읍니다.',
    art: <GuideArtSellerListing />,
  },
  {
    step: '03',
    title: '판매 관리',
    body: '마이페이지에서 판매 확정과 건별 결제·배송을 관리합니다. 결제·정산은 판매자와 구매자가 직접 합니다.',
    art: <GuideArtSellerManage />,
  },
];

const BUYER_CARDS: GuideCard[] = [
  {
    step: '01',
    title: '가입·역할',
    body: '이메일로 가입합니다. 로그인 후 구매자 모드를 고르고, 핸드폰과 배송 주소를 등록합니다.',
    art: <GuideArtBuyerSignup />,
  },
  {
    step: '02',
    title: '공구 구매 신청',
    body: '팝니다에서 구매 수량을 신청합니다. 판매 확정 후 입금 기한 안에 입금하면, 판매자가 결제·배송을 확인합니다.',
    art: <GuideArtBuyerJoin />,
  },
  {
    step: '03',
    title: '삽니다 등록',
    body: '찾는 상품, 가격, 수량, 마감을 올려 판매자를 모읍니다.',
    art: <GuideArtBuyerWanted />,
  },
];

type GuideVariant = 'seller' | 'buyer';

const GUIDE_VARIANT_STYLES: Record<
  GuideVariant,
  { art: string; card: string; step: string; badge: string; label: string; border: string }
> = {
  seller: {
    art: 'home-guide-art--seller',
    card: 'home-guide-card--seller',
    step: 'text-amber-400/70',
    badge: 'bg-amber-100 text-amber-800',
    label: 'text-amber-700',
    border: 'border-amber-200',
  },
  buyer: {
    art: 'home-guide-art--buyer',
    card: 'home-guide-card--buyer',
    step: 'text-sky-400/70',
    badge: 'bg-sky-100 text-sky-800',
    label: 'text-sky-700',
    border: 'border-sky-200',
  },
};

function GuideCardRow({
  label,
  subtitle,
  cards,
  variant,
}: {
  label: string;
  subtitle: string;
  cards: GuideCard[];
  variant: GuideVariant;
}) {
  const styles = GUIDE_VARIANT_STYLES[variant];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${styles.badge}`}>{label}</span>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>
      <ol className="grid gap-4 sm:grid-cols-3">
        {cards.map((card, index) => (
          <li
            key={`${label}-${card.step}`}
            className={`seller-guide-card panel flex h-full flex-col overflow-hidden border-t-[3px] ${styles.card} ${styles.border}`}
            style={{ animationDelay: `${index * 140}ms` }}
          >
            <div className={`seller-guide-art relative h-36 sm:h-40 ${styles.art}`}>
              <span
                className={`pointer-events-none absolute right-3 top-2 font-sans text-4xl font-bold tabular-nums leading-none ${styles.step}`}
              >
                {card.step}
              </span>
              {card.art}
            </div>
            <div className={`flex flex-1 flex-col border-t px-4 py-4 sm:px-5 ${styles.border}`}>
              <p className={`text-[11px] font-semibold tracking-[0.14em] ${styles.label}`}>
                {label} {card.step}
              </p>
              <h3 className="mt-1.5 text-base font-bold text-ink">{card.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{card.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function HomeGuide() {
  return (
    <section>
      <h2 className="text-[15px] font-bold text-ink">이용 안내</h2>
      <div className="mt-4 space-y-8">
        <GuideCardRow variant="seller" label="판매자" subtitle="판매자로 이용할 때" cards={SELLER_CARDS} />
        <GuideCardRow variant="buyer" label="구매자" subtitle="구매자로 이용할 때" cards={BUYER_CARDS} />
      </div>
    </section>
  );
}
