'use client';

import { motion } from 'framer-motion';
import { Anime, TIER_COLORS } from '@/types';
import { getDailyBoxes } from '@/lib/daily-seed';

interface AnimeValueBoardProps {
  openedAnime: Anime[];
  seed?: string;
}

function BriefcaseClosed({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="8" y1="13" x2="16" y2="13" />
    </svg>
  );
}

function BriefcaseOpen() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 9h18l-1 12H4L3 9z" />
    </svg>
  );
}

function evColor(ev: number): string {
  if (ev >= 8.5) return '#15803d';
  if (ev >= 7.5) return '#65a30d';
  if (ev >= 7.0) return '#ca8a04';
  if (ev >= 6.0) return '#ea580c';
  if (ev >= 5.0) return '#dc2626';
  return '#7f1d1d';
}

export default function AnimeValueBoard({ openedAnime, seed }: AnimeValueBoardProps) {
  const todayBoxes = getDailyBoxes(seed);
  const openedIds = new Set(openedAnime.map(a => a.id));

  const sorted = [...todayBoxes].sort((a, b) => b.rating - a.rating);
  const remaining = sorted.filter(a => !openedIds.has(a.id));
  const ev = remaining.length > 0
    ? remaining.reduce((s, a) => s + a.rating, 0) / remaining.length
    : 0;
  const color = evColor(ev);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/8">
        <p className="text-[10px] font-black tracking-widest uppercase text-white/50">Today&apos;s Board</p>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/25">{remaining.length}/{sorted.length} left</span>
          {ev > 0 && (
            <span
              className="text-[9px] font-black px-1.5 py-0.5 rounded"
              style={{ color, background: color + '18', border: `1px solid ${color}35` }}
            >
              EV {ev.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Ranked list */}
      <div className="flex flex-col gap-1">
        {sorted.map(anime => {
          const eliminated = openedIds.has(anime.id);
          const c = TIER_COLORS[anime.tier];
          const barPct = Math.max(0, Math.min(100, ((anime.rating - 4) / 6) * 100));

          return (
            <motion.div
              key={anime.id}
              animate={{ opacity: eliminated ? 0.3 : 1 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-2 py-1"
            >
              {/* Briefcase icon */}
              <div className="flex-shrink-0">
                {eliminated ? <BriefcaseOpen /> : <BriefcaseClosed color={c} />}
              </div>

              {/* Rating */}
              <span
                className="text-xs font-black tabular-nums w-8 flex-shrink-0"
                style={{ color: eliminated ? 'rgba(255,255,255,0.2)' : c }}
              >
                {anime.rating.toFixed(1)}
              </span>

              {/* Title + bar */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-[10px] font-semibold truncate leading-none mb-1"
                  style={{
                    color: eliminated ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.80)',
                    textDecoration: eliminated ? 'line-through' : 'none',
                  }}
                >
                  {anime.title}
                </p>
                <div className="h-0.5 rounded-full bg-white/6 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ width: eliminated ? '0%' : barPct + '%' }}
                    transition={{ duration: 0.45 }}
                    style={{ background: c }}
                  />
                </div>
              </div>

              {/* Tier badge */}
              <span
                className="text-[8px] font-black px-1 py-0.5 rounded flex-shrink-0"
                style={{
                  color: eliminated ? 'rgba(255,255,255,0.15)' : c,
                  border: `1px solid ${eliminated ? 'rgba(255,255,255,0.06)' : c + '40'}`,
                  background: eliminated ? 'transparent' : c + '10',
                }}
              >
                {anime.tier}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
