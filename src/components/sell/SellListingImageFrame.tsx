import { cn } from '@/lib/utils';

function cssBackgroundImage(url: string) {
  const safe = url.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `url("${safe}")`;
}

type SellListingImageFrameProps = {
  src?: string | null;
  alt?: string;
  mode?: 'square' | 'fill';
  className?: string;
  children?: React.ReactNode;
  emptyLabel?: string;
};

export default function SellListingImageFrame({
  src,
  alt = '',
  mode = 'square',
  className,
  children,
  emptyLabel = '사진 없음',
}: SellListingImageFrameProps) {
  if (mode === 'fill') {
    return (
      <div className={cn('sell-listing-image-fill', className)}>
        {src ? (
          <div
            className="sell-listing-image-fill__media"
            style={{ backgroundImage: cssBackgroundImage(src) }}
            role="img"
            aria-label={alt}
          />
        ) : (
          <span className="sell-listing-image-fill__empty">{emptyLabel}</span>
        )}
        {children}
      </div>
    );
  }

  return (
    <div className={cn('sell-product-card-thumb', className)}>
      <div className="sell-product-card-thumb__frame">
        <span className="sell-product-card-thumb__ratio" aria-hidden />
        {src ? (
          <div
            className="sell-product-card-thumb__media"
            style={{ backgroundImage: cssBackgroundImage(src) }}
            role="img"
            aria-label={alt}
          />
        ) : (
          <span className="sell-product-card-thumb__empty">{emptyLabel}</span>
        )}
        {children}
      </div>
    </div>
  );
}
