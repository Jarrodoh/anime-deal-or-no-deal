'use client';

import { motion } from 'framer-motion';
import { Anime, AnimeTier, TIER_COLORS } from '@/types';
import { getDailyBoxes } from '@/lib/daily-seed';
import RatingMeter from './RatingMeter';

interface AnimeValueBoardProps {
  openedAnime: Anime[];
  seed?: string;
}

function BriefcaseClosed({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="8" y1="13" x2="16" y2="13" />
    </svg>
  );
}

function BriefcaseOpen() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 9h18l-1 12H4L3 9z" />
    </svg>
  );
}

const CARD_HEIGHT = 124;

export default function AnimeValueBoard({ openedAnime, seed }: AnimeValueBoardProps) {
  const todayBoxes = getDailyBoxes(seed);
  const openedIds = new Set(openedAnime.map(a => a.id));

  const sorted = [...todayBoxes].sort((a, b) => b.rating - a.rating);
  const remaining = sorted.filter(a => !openedIds.has(a.id));
  const ev = remaining.length > 0
    ? remaining.reduce((s, a) => s + a.rating, 0) / remaining.length
    : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/8">
        <p className="text-[10px] font-black tracking-widest uppercase text-white/50">Today&apos;s Board</p>
        <span className="text-[10px] text-white/25 font-mono">{remaining.length} / {sorted.length} left</span>
      </div>

      {/* Meter + horizontal cards */}
      <div className="flex items-stretch gap-3">
        <RatingMeter value={ev > 0 ? ev : 7.0} height={CARD_HEIGHT} />

        {/* Horizontal card row — scrollable on small screens */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-2" style={{ minWidth: sorted.length * 94 }}>
            {sorted.map(anime => {
              const eliminated = openedIds.has(anime.id);
              const color = TIER_COLORS[anime.tier];
              const barPct = Math.max(0, ((anime.rating - 4) / 6) * 100);

              return (
                <motion.div
                  key={anime.id}
                  animate={{ opacity: eliminated ? 0.28 : 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex-1 flex flex-col items-center justify-between rounded-xl border relative overflow-hidden"
                  style={{
                    minWidth: 88,
                    height: CARD_HEIGHT,
                    border: `1px solid ${eliminated ? 'rgba(255,255,255,0.05)' : color + '30'}`,
                    background: eliminated ? 'rgba(255,255,255,0.015)' : color + '0a',
                    padding: '8px 6px',
                  }}
                >
                  {/* Background fill bar */}
                  {!eliminated && (
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-b-xl opacity-10"
                      style={{ height: barPct + '%', background: color }}
                    />
                  )}

                  <div className="relative flex flex-col items-center gap-1 w-full">
                    {/* Briefcase */}
                    {eliminated ? <BriefcaseOpen /> : <BriefcaseClosed color={color} />}

                    {/* Rating */}
                    <span
                      className="text-sm font-black tabular-nums leading-none"
                      style={{ color: eliminated ? 'rgba(255,255,255,0.2)' : color }}
                    >
                      {anime.rating.toFixed(1)}
                    </span>

                    {/* Title */}
                    <span
                      className="text-[8px] font-semibold text-center leading-tight line-clamp-2 w-full px-1"
                      style={{
                        color: eliminated ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.75)',
                        textDecoration: eliminated ? 'line-through' : 'none',
                      }}
                    >
                      {anime.title}
                    </span>
                  </div>

                  {/* Bottom: meter bar + tier */}
                  <div className="relative flex flex-col items-center gap-1 w-full">
                    <div className="w-full h-0.5 rounded-full bg-white/6">
                      <motion.div
                        className="h-full rounded-full"
                        animate={{ width: eliminated ? '0%' : barPct + '%' }}
                        transition={{ duration: 0.5 }}
                        style={{ background: color }}
                      />
                    </div>
                    <span
                      className="text-[8px] font-black px-1.5 py-0.5 rounded"
                      style={{
                        color: eliminated ? 'rgba(255,255,255,0.15)' : color,
                        border: `1px solid ${eliminated ? 'rgba(255,255,255,0.04)' : color + '38'}`,
                        background: eliminated ? 'transparent' : color + '12',
                      }}
                    >
                      {anime.tier}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
