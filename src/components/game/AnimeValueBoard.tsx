'use client';

import { motion } from 'framer-motion';
import { Anime, AnimeTier, TIER_COLORS } from '@/types';
import { getDailyBoxes } from '@/lib/daily-seed';
import RatingMeter from './RatingMeter';

interface AnimeValueBoardProps {
  openedAnime: Anime[];
}

function BriefcaseClosed({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="8" y1="13" x2="16" y2="13" />
    </svg>
  );
}

function BriefcaseOpen() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 9h18l-1 12H4L3 9z" />
      <line x1="3" y1="9" x2="21" y2="9" />
    </svg>
  );
}

export default function AnimeValueBoard({ openedAnime }: AnimeValueBoardProps) {
  const todayBoxes = getDailyBoxes();
  const openedIds = new Set(openedAnime.map(a => a.id));

  const sorted = [...todayBoxes].sort((a, b) => b.rating - a.rating);

  const remaining = sorted.filter(a => !openedIds.has(a.id));
  const ev = remaining.length > 0
    ? remaining.reduce((s, a) => s + a.rating, 0) / remaining.length
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/8">
        <p className="text-[10px] font-black tracking-widest uppercase text-white/50">Today&apos;s Board</p>
        <span className="text-[10px] text-white/25 font-mono">{remaining.length} / {sorted.length} left</span>
      </div>

      <div className="flex gap-4 items-start">
        {/* Vertical rating meter */}
        <RatingMeter value={ev > 0 ? ev : 7.0} />

        {/* Anime list */}
        <div className="flex-1 space-y-1 min-w-0">
          {sorted.map((anime) => {
            const eliminated = openedIds.has(anime.id);
            const color = TIER_COLORS[anime.tier];
            const barPct = ((anime.rating - 4) / 6) * 100; // 4–10 range → 0–100%

            return (
              <motion.div
                key={anime.id}
                animate={{ opacity: eliminated ? 0.28 : 1 }}
                transition={{ duration: 0.4 }}
                className="relative rounded-lg overflow-hidden"
                style={{
                  border: `1px solid ${eliminated ? 'rgba(255,255,255,0.05)' : color + '28'}`,
                  background: eliminated ? 'rgba(255,255,255,0.015)' : color + '0a',
                }}
              >
                {/* Background fill bar */}
                {!eliminated && (
                  <div
                    className="absolute left-0 top-0 bottom-0 rounded-l-lg opacity-10"
                    style={{ width: barPct + '%', background: color }}
                  />
                )}

                <div className="relative flex items-center gap-2 px-2 py-1.5">
                  <div className="flex-shrink-0">
                    {eliminated ? <BriefcaseOpen /> : <BriefcaseClosed color={color} />}
                  </div>

                  <span
                    className="text-[11px] font-black tabular-nums flex-shrink-0"
                    style={{ color: eliminated ? 'rgba(255,255,255,0.18)' : color, width: 26 }}
                  >
                    {anime.rating.toFixed(1)}
                  </span>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span
                      className="text-[10px] font-semibold leading-tight truncate"
                      style={{
                        color: eliminated ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.80)',
                        textDecoration: eliminated ? 'line-through' : 'none',
                      }}
                    >
                      {anime.title}
                    </span>
                    {/* Mini meter bar */}
                    <div className="mt-0.5 h-0.5 rounded-full bg-white/5">
                      <motion.div
                        className="h-full rounded-full"
                        animate={{ width: eliminated ? '0%' : barPct + '%' }}
                        transition={{ duration: 0.5 }}
                        style={{ background: color }}
                      />
                    </div>
                  </div>

                  <span
                    className="text-[8px] font-black flex-shrink-0 px-1 py-0.5 rounded"
                    style={{
                      color: eliminated ? 'rgba(255,255,255,0.12)' : color,
                      border: `1px solid ${eliminated ? 'rgba(255,255,255,0.04)' : color + '35'}`,
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
  );
}
