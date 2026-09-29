'use client';

import { youtubeEmbedSrc } from '@/lib/sell-source';

export default function SellYoutubeEmbed({ url }: { url: string }) {
  const src = youtubeEmbedSrc(url);
  if (!src) return null;
  return (
    <div className="border-t border-line bg-black">
      <iframe
        src={src}
        title="유튜브 판매상품"
        className="aspect-video w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
