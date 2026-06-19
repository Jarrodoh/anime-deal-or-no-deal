'use client';

import { motion } from 'framer-motion';
import { Anime, AnimeTier, TIER_COLORS } from '@/types';
import { getDailyBoxes } from '@/lib/daily-seed';

interface AnimeValueBoardProps {
  openedAnime: Anime[];
}

// Closed briefcase SVG
function BriefcaseClosed({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="12" strokeWidth="3" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

// Open / eliminated briefcase
function BriefcaseOpen() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
      <path d="M2 10h20v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2z" />
      <path d="M2 10l2 11h16l2-11" />
    </svg>
  );
}

const TIER_RANK: Record<AnimeTier, number> = { S: 6, A: 5, B: 4, C: 3, D: 2, F: 1 };

export default function AnimeValueBoard({ openedAnime }: AnimeValueBoardProps) {
  const todayBoxes = getDailyBoxes();
  const openedIds = new Set(openedAnime.map(a => a.id));

  // Sort highest rating first so the board reads like DoND (big values at top)
  const sorted = [...todayBoxes].sort((a, b) => b.rating - a.rating);

  const remaining = sorted.filter(a => !openedIds.has(a.id));
  const ev = remaining.length > 0
    ? remaining.reduce((s, a) => s + a.rating, 0) / remaining.length
    : 0;

  const maxRating = 10;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/8">
        <p className="text-xs font-black tracking-widest uppercase text-white/60">
          Today&apos;s Board
        </p>
        <span className="text-xs text-white/30 font-mono">{remaining.length} left</span>
      </div>

      {/* Rows */}
      <div className="space-y-1.5">
        {sorted.map((anime, idx) => {
          const eliminated = openedIds.has(anime.id);
          const color = TIER_COLORS[anime.tier];
          const barWidth = (anime.rating / maxRating) * 100;

          return (
            <motion.div
              key={anime.id}
              initial={false}
              animate={{ opacity: eliminated ? 0.3 : 1 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-lg overflow-hidden"
              style={{
                background: eliminated
                  ? 'rgba(255,255,255,0.02)'
                  : color + '0d',
                border: `1px solid ${eliminated ? 'rgba(255,255,255,0.05)' : color + '30'}`,
              }}
            >
              {/* Rank bar fills left side */}
              {!eliminated && (
                <div
                  className="absolute left-0 top-0 bottom-0 opacity-10 rounded-l-lg"
                  style={{ width: barWidth + '%', background: color }}
                />
              )}

              <div className="relative flex items-center gap-2 px-2.5 py-2">
                {/* Rank number */}
                <span className="text-[10px] font-bold text-white/20 w-3 tabular-nums flex-shrink-0">
                  {idx + 1}
                </span>

                {/* Briefcase icon */}
                <div className="flex-shrink-0">
                  {eliminated ? <BriefcaseOpen /> : <BriefcaseClosed color={color} />}
                </div>

                {/* Rating */}
                <span
                  className="text-sm font-black tabular-nums flex-shrink-0 w-8"
                  style={{ color: eliminated ? 'rgba(255,255,255,0.2)' : color }}
                >
                  {anime.rating.toFixed(1)}
                </span>

                {/* Title + tier pill */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span
                    className="text-[11px] font-semibold leading-tight truncate"
                    style={{
                      color: eliminated ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.85)',
                      textDecoration: eliminated ? 'line-through' : 'none',
                    }}
                  >
                    {anime.title}
                  </span>
                  {/* Meter bar */}
                  <div className="mt-0.5 h-1 rounded-full bg-white/5 overflow-hidden w-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: eliminated ? '0%' : barWidth + '%' }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: eliminated ? 'transparent' : color }}
                    />
                  </div>
                </div>

                {/* Tier badge */}
                <span
                  className="text-[9px] font-black flex-shrink-0 px-1 py-0.5 rounded"
                  style={{
                    color: eliminated ? 'rgba(255,255,255,0.15)' : color,
                    border: `1px solid ${eliminated ? 'rgba(255,255,255,0.05)' : color + '40'}`,
                    background: eliminated ? 'transparent' : color + '15',
                  }}
                >
                  {anime.tier}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* EV footer */}
      {remaining.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-white/8 flex items-center justify-between">
          <span className="text-[10px] text-white/30 uppercase tracking-wide">Board avg</span>
          <span className="text-sm font-black text-white/70">{ev.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
