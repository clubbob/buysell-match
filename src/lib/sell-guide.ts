import type { SellListing } from '@/types/sell';

export type SellGuide = {
  intro: string;
  spec: string;
  trade: string;
};

const HEADING = /^(구성|규격|공구|결제|배송|교환|거래|소개)([·\s:].*)?$/;

function isHeading(line: string) {
  return HEADING.test(line.trim());
}

function headingGroup(line: string): 'intro' | 'spec' | 'trade' {
  const key = line.trim().replace(/[·\s:].*$/, '');
  if (key === '구성' || key === '규격') return 'spec';
  if (key === '소개') return 'intro';
  return 'trade';
}

export function parseGuideText(text: string): SellGuide {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const intro: string[] = [];
  const spec: string[] = [];
  const trade: string[] = [];
  let bucket: 'intro' | 'spec' | 'trade' = 'intro';
  let sawHeading = false;

  for (const line of lines) {
    if (isHeading(line)) {
      sawHeading = true;
      bucket = headingGroup(line);
      continue;
    }
    if (bucket === 'spec') spec.push(line);
    else if (bucket === 'trade') trade.push(line);
    else intro.push(line);
  }

  if (!sawHeading) {
    return { intro: text.trim(), spec: '', trade: '' };
  }

  return {
    intro: intro.join('\n').trim(),
    spec: spec.join('\n').trim(),
    trade: trade.join('\n').trim(),
  };
}

export function listingGuide(item: Pick<SellListing, 'description' | 'specText' | 'tradeText'>): SellGuide {
  if (item.specText.trim() || item.tradeText.trim()) {
    return {
      intro: item.description.trim(),
      spec: item.specText.trim(),
      trade: item.tradeText.trim(),
    };
  }
  return parseGuideText(item.description);
}

export function guideHasContent(guide: SellGuide) {
  return Boolean(guide.intro || guide.spec || guide.trade);
}
