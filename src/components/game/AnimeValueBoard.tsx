'use client';

import { motion } from 'framer-motion';
import { Anime, TIER_COLORS } from '@/types';
import { getDailyBoxes } from '@/lib/daily-seed';
import RatingMeter from './RatingMeter';

interface AnimeValueBoardProps {
  openedAnime: Anime[];
  seed?: string;
}

function BriefcaseClosed({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="8" y1="13" x2="16" y2="13" />
    </svg>
  );
}

function BriefcaseOpen() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 9h18l-1 12H4L3 9z" />
    </svg>
  );
}

const ROW_H = 28;

export default function AnimeValueBoard({ openedAnime, seed }: AnimeValueBoardProps) {
  const todayBoxes = getDailyBoxes(seed);
  const openedIds = new Set(openedAnime.map(a => a.id));

  const sorted = [...todayBoxes].sort((a, b) => b.rating - a.rating);
  const remaining = sorted.filter(a => !openedIds.has(a.id));
  const ev = remaining.length > 0
    ? remaining.reduce((s, a) => s + a.rating, 0) / remaining.length
    : 0;

  const listHeight = sorted.length * ROW_H + (sorted.length - 1) * 4;

  return (
    <div>
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/8">
        <p className="text-[10px] font-black tracking-widest uppercase text-white/50">Today&apos;s Board</p>
        <span className="text-[10px] text-white/25 font-mono">{remaining.length}/{sorted.length}</span>
      </div>

      <div className="flex gap-3 items-start">
        <RatingMeter value={ev > 0 ? ev : 7.0} height={listHeight} />

        <div className="flex-1 flex flex-col gap-1">
          {sorted.map(anime => {
            const eliminated = openedIds.has(anime.id);
            const color = TIER_COLORS[anime.tier];
            const barPct = Math.max(0, ((anime.rating - 4) / 6) * 100);

            return (
              <motion.div
                key={anime.id}
                animate={{ opacity: eliminated ? 0.28 : 1 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2"
                style={{ height: ROW_H }}
              >
                {eliminated ? <BriefcaseOpen /> : <BriefcaseClosed color={color} />}

                <span
                  className="text-xs font-black tabular-nums w-8 flex-shrink-0"
                  style={{ color: eliminated ? 'rgba(255,255,255,0.2)' : color }}
                >
                  {anime.rating.toFixed(1)}
                </span>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-[10px] font-semibold truncate leading-none mb-1"
                    style={{
                      color: eliminated ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.75)',
                      textDecoration: eliminated ? 'line-through' : 'none',
                    }}
                  >
                    {anime.title}
                  </p>
                  <div className="h-0.5 rounded-full bg-white/6">
                    <motion.div
                      className="h-full rounded-full"
                      animate={{ width: eliminated ? '0%' : barPct + '%' }}
                      transition={{ duration: 0.5 }}
                      style={{ background: color }}
                    />
                  </div>
                </div>

                <span
                  className="text-[8px] font-black px-1 py-0.5 rounded flex-shrink-0"
                  style={{
                    color: eliminated ? 'rgba(255,255,255,0.15)' : color,
                    border: `1px solid ${eliminated ? 'rgba(255,255,255,0.04)' : color + '35'}`,
                  }}
                >
                  {anime.tier}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
