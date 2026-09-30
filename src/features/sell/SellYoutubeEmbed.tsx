'use client';

import { useState } from 'react';
import SellProductLink from '@/features/sell/SellProductLink';
import { youtubeVideoId } from '@/lib/sell-source';
import { cn } from '@/lib/utils';

export default function SellYoutubeEmbed({ url }: { url: string }) {
  const id = youtubeVideoId(url);
  const [open, setOpen] = useState(false);

  if (!id) return <SellProductLink href={url} label="유튜브" />;

  return (
    <div className="min-w-0 w-full">
      <button
        type="button"
        className={cn('btn-chip', open && 'bg-ink text-white hover:bg-ink hover:text-white')}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        유튜브
      </button>
      {open ? (
        <div className="mt-3 aspect-video w-full overflow-hidden bg-ink">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title="유튜브"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : null}
    </div>
  );
}
