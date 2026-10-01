import Link from 'next/link';
import { cn } from '@/lib/utils';

type MarketplaceCard = {
  href: string;
  title: string;
  description: string;
  tone: 'sell' | 'buy';
};

const CARDS: MarketplaceCard[] = [
  {
    href: '/sell',
    title: '팝니다',
    description: '판매자가 올린 공동구매 상품을 보고 참여합니다.',
    tone: 'sell',
  },
  {
    href: '/buy',
    title: '삽니다',
    description: '찾는 상품을 올리거나, 구매 요청을 확인합니다.',
    tone: 'buy',
  },
];

const TONE_STYLES = {
  sell: {
    border: 'border-amber-200',
    top: 'border-t-amber-500',
    bg: 'bg-gradient-to-b from-amber-50 to-white hover:from-amber-100/80',
    title: 'text-amber-950',
    cta: 'text-amber-700 group-hover:text-amber-800',
  },
  buy: {
    border: 'border-sky-300',
    top: 'border-t-sky-500',
    bg: 'bg-gradient-to-b from-sky-50 to-white hover:from-sky-100/80',
    title: 'text-sky-900',
    cta: 'text-sky-700 group-hover:text-sky-800',
  },
} as const;

export default function HomeMarketplaceIntro() {
  return (
    <section aria-label="장터 바로가기">
      <p className="mb-3 text-sm text-muted">어디로 갈까요?</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {CARDS.map((card) => {
          const styles = TONE_STYLES[card.tone];
          return (
            <Link
              key={card.href}
              href={card.href}
              className={cn(
                'group panel flex flex-col border-t-[3px] px-4 py-4 transition-colors sm:px-5 sm:py-5',
                styles.border,
                styles.top,
                styles.bg,
              )}
            >
              <h2 className={cn('text-lg font-bold', styles.title)}>{card.title}</h2>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{card.description}</p>
              <span className={cn('mt-3 text-sm font-semibold', styles.cta)}>보러 가기 →</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
