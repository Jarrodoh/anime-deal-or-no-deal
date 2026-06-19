'use client';

import { useState, useEffect } from 'react';

interface AnimeImageProps {
  anilistId: number | undefined;
  title: string;
  className?: string;
}

export default function AnimeImage({ anilistId, title, className = '' }: AnimeImageProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (!anilistId) return;
    let cancelled = false;
    fetch(`/api/anime-image?id=${anilistId}`)
      .then(r => r.json())
      .then(d => { if (!cancelled && d.url) setUrl(d.url); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [anilistId]);

  if (!url || errored) {
    return (
      <div className={`flex items-center justify-center bg-white/5 rounded-lg ${className}`}>
        <span className="text-white/25 text-xs text-center px-2 leading-tight">{title}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={title}
      className={`object-cover rounded-lg ${className}`}
      onError={() => setErrored(true)}
      loading="lazy"
    />
  );
}
