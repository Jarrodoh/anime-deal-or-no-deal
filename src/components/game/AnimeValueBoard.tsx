'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Anime, AnimeTier, TIER_COLORS, TIER_LABELS } from '@/types';
import { getDailyBoxes } from '@/lib/daily-seed';
import { clsx } from 'clsx';

interface AnimeValueBoardProps {
  openedAnime: Anime[];
}

const TIER_ORDER: AnimeTier[] = ['S', 'A', 'B', 'C', 'D', 'F'];

function groupByTier(anime: Anime[]): Record<AnimeTier, Anime[]> {
  const result: Record<AnimeTier, Anime[]> = { S: [], A: [], B: [], C: [], D: [], F: [] };
  anime.forEach(a => result[a.tier].push(a));
  return result;
}

export default function AnimeValueBoard({ openedAnime }: AnimeValueBoardProps) {
  const todayBoxes = getDailyBoxes();
  const allGroups = groupByTier(todayBoxes);
  const openedTitles = new Set(openedAnime.map(a => a.id));

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-white/40 uppercase tracking-widest mb-2 font-semibold">
        Board Values
      </p>
      {TIER_ORDER.map(tier => {
        const allInTier = allGroups[tier];
        const color = TIER_COLORS[tier];

        return (
          <div key={tier} className="flex items-start gap-2">
            {/* Tier label */}
            <div
              className={clsx(
                'flex-shrink-0 w-7 h-7 rounded flex items-center justify-center text-xs font-black border',
                'tier-' + tier,
              )}
            >
              {tier}
            </div>

            {/* Anime list for this tier */}
            <div className="flex flex-wrap gap-1 flex-1">
              {allInTier.map(anime => {
                const isEliminated = openedTitles.has(anime.id);
                return (
                  <AnimatePresence key={anime.id} mode="wait">
                    {!isEliminated ? (
                      <motion.span
                        key="active"
                        initial={{ opacity: 1 }}
                        className="text-[10px] px-1.5 py-0.5 rounded border"
                        style={{
                          borderColor: color + '40',
                          color: color,
                          background: color + '10',
                        }}
                      >
                        {anime.rating.toFixed(1)}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="eliminated"
                        initial={{ opacity: 1, scale: 1 }}
                        animate={{ opacity: 0.2, scale: 0.9 }}
                        className="text-[10px] px-1.5 py-0.5 rounded border border-white/5 text-white/20 line-through"
                      >
                        {anime.rating.toFixed(1)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-white/5">
        {TIER_ORDER.map(tier => (
          <div key={tier} className="flex items-center gap-1.5 text-[10px] text-white/40 mb-0.5">
            <span style={{ color: TIER_COLORS[tier] }} className="font-bold">{tier}</span>
            <span>{TIER_LABELS[tier]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
