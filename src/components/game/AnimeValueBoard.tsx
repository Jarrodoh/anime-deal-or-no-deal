'use client';

import { motion } from 'framer-motion';
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
  const openedIds = new Set(openedAnime.map(a => a.id));

  return (
    <div className="space-y-2">
      <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-2">
        Today's Board
      </p>

      {TIER_ORDER.map(tier => {
        const entries = allGroups[tier];
        if (entries.length === 0) return null;
        const color = TIER_COLORS[tier];

        return (
          <div key={tier} className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span
                className={clsx('text-[10px] font-black border rounded px-1.5 py-0.5 tier-' + tier)}
              >
                {tier}
              </span>
              <span className="text-[10px] text-white/25">{TIER_LABELS[tier]}</span>
            </div>

            {entries.map(anime => {
              const eliminated = openedIds.has(anime.id);
              return (
                <motion.div
                  key={anime.id}
                  initial={false}
                  animate={{ opacity: eliminated ? 0.25 : 1 }}
                  className="flex items-center gap-2 pl-4"
                >
                  <span
                    className="text-[10px] font-bold tabular-nums"
                    style={{ color: eliminated ? 'rgba(255,255,255,0.2)' : color }}
                  >
                    {anime.rating.toFixed(1)}
                  </span>
                  <span
                    className={clsx(
                      'text-[10px] leading-tight truncate',
                      eliminated ? 'text-white/20 line-through' : 'text-white/60',
                    )}
                  >
                    {anime.title}
                  </span>
                </motion.div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
