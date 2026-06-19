'use client';

import { ROUND_CONFIGS } from '@/types';
import { clsx } from 'clsx';

interface RoundTrackerProps {
  currentRound: number;
  boxesOpenedThisRound: number;
  phase: string;
}

export default function RoundTracker({ currentRound, boxesOpenedThisRound, phase }: RoundTrackerProps) {
  if (phase === 'pick_box' || phase === 'intro') return null;

  const config = ROUND_CONFIGS.find(r => r.round === currentRound);
  const target = config?.boxesToOpen ?? 1;

  return (
    <div className="flex items-center gap-3">
      <div className="text-xs text-white/40 uppercase tracking-wider font-semibold whitespace-nowrap">
        Round {currentRound}
      </div>

      {/* Round progress dots */}
      <div className="flex items-center gap-1">
        {Array.from({ length: target }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'w-2 h-2 rounded-full transition-all duration-300',
              i < boxesOpenedThisRound
                ? 'bg-yellow-400'
                : 'bg-white/15',
            )}
          />
        ))}
      </div>

      <div className="text-xs text-white/40">
        {boxesOpenedThisRound}/{target} opened
      </div>

      {/* All rounds mini timeline */}
      <div className="flex items-center gap-1 ml-auto">
        {ROUND_CONFIGS.map(r => (
          <div
            key={r.round}
            className={clsx(
              'text-[9px] font-bold px-1.5 py-0.5 rounded transition-all',
              r.round < currentRound
                ? 'bg-white/10 text-white/30'
                : r.round === currentRound
                ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/40'
                : 'bg-white/4 text-white/20',
            )}
          >
            R{r.round}
          </div>
        ))}
      </div>
    </div>
  );
}
