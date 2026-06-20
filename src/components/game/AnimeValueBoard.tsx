'use client';

import { motion } from 'framer-motion';
import { Anime, TIER_COLORS } from '@/types';
import { getDailyBoxes } from '@/lib/daily-seed';

interface AnimeValueBoardProps {
  openedAnime: Anime[];
  seed?: string;
}

export default function AnimeValueBoard({ openedAnime, seed }: AnimeValueBoardProps) {
  const todayBoxes = getDailyBoxes(seed);
  const openedIds = new Set(openedAnime.map(a => a.id));

  // Sort by rating descending
  const sorted = [...todayBoxes].sort((a, b) => b.rating - a.rating);
  const remaining = sorted.filter(a => !openedIds.has(a.id));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/8">
        <span className="text-[10px] font-black tracking-widest uppercase text-white/70">Board</span>
        <span className="text-[10px] font-semibold tabular-nums text-white/55">{remaining.length} / {sorted.length} left</span>
      </div>

      {/* Ranked rows */}
      <div>
        {sorted.map((anime, idx) => {
          const eliminated = openedIds.has(anime.id);
          const c = TIER_COLORS[anime.tier];

          return (
            <motion.div
              key={anime.id}
              animate={{ opacity: eliminated ? 0.28 : 1 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2 py-[7px] border-b border-white/5 last:border-0"
            >
              {/* Rank */}
              <span className="w-4 text-[9px] font-bold tabular-nums text-right text-white/45 flex-shrink-0">
                {idx + 1}
              </span>

              {/* Tier stripe */}
              <div
                className="w-[3px] h-[14px] rounded-full flex-shrink-0"
                style={{ background: eliminated ? 'rgba(255,255,255,0.08)' : c }}
              />

              {/* Title */}
              <p
                className="flex-1 min-w-0 text-[11px] font-semibold leading-none truncate"
                style={{
                  color: eliminated ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.88)',
                  textDecoration: eliminated ? 'line-through' : 'none',
                }}
              >
                {anime.title}
              </p>

              {/* Rating */}
              <span
                className="text-[11px] font-black tabular-nums flex-shrink-0"
                style={{ color: eliminated ? 'rgba(255,255,255,0.15)' : c }}
              >
                {anime.rating.toFixed(1)}
              </span>

              {/* Tier badge */}
              <div
                className="w-[18px] h-[18px] rounded flex items-center justify-center text-[8px] font-black flex-shrink-0"
                style={eliminated
                  ? { color: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.05)' }
                  : { color: c, border: `1px solid ${c}55`, background: `${c}14` }
                }
              >
                {anime.tier}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
