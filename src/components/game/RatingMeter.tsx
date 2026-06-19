'use client';

import { motion } from 'framer-motion';

interface RatingMeterProps {
  value: number;
  height?: number;
}

const MIN = 4.0;
const MAX = 10.0;

const ZONES = [
  { label: 'MAX',    floor: 8.5, color: '#15803d' },
  { label: 'HIGH',   floor: 7.5, color: '#65a30d' },
  { label: 'NORMAL', floor: 7.0, color: '#ca8a04' },
  { label: 'MEDIUM', floor: 6.0, color: '#ea580c' },
  { label: 'LOW',    floor: 5.0, color: '#dc2626' },
  { label: 'NO',     floor: MIN, color: '#7f1d1d' },
];

function toPct(rating: number): number {
  return Math.max(0, Math.min(100, ((rating - MIN) / (MAX - MIN)) * 100));
}

function zoneColor(rating: number): string {
  for (const z of ZONES) {
    if (rating >= z.floor) return z.color;
  }
  return ZONES[ZONES.length - 1].color;
}

export default function RatingMeter({ value, height = 200 }: RatingMeterProps) {
  const fillPct = toPct(value);
  const color = zoneColor(value);

  return (
    <div className="flex flex-col items-center flex-shrink-0" style={{ width: 56 }}>
      <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2">EV</p>

      {/* Meter + labels */}
      <div className="relative flex-1 w-full" style={{ height }}>

        {/* Zone labels left-aligned at zone midpoints */}
        {ZONES.map((z, i) => {
          const floorPct = toPct(z.floor);
          const ceilPct = i === 0 ? 100 : toPct(ZONES[i - 1].floor);
          const midPct = (floorPct + ceilPct) / 2;
          const bottomPx = (midPct / 100) * height - 6;
          return (
            <span
              key={z.label}
              className="absolute text-[8px] font-black leading-none"
              style={{ color: z.color + 'bb', bottom: bottomPx, left: 0, width: 30, textAlign: 'right' }}
            >
              {z.label}
            </span>
          );
        })}

        {/* Bar track */}
        <div
          className="absolute rounded-full overflow-hidden"
          style={{ width: 18, right: 4, top: 0, bottom: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
        >
          {/* Dim gradient always visible */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,#7f1d1d 0%,#dc2626 14%,#ea580c 30%,#ca8a04 46%,#65a30d 64%,#15803d 100%)', opacity: 0.18 }} />
          {/* Active fill */}
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            animate={{ height: fillPct + '%' }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
            style={{ background: 'linear-gradient(to top,#7f1d1d 0%,#dc2626 14%,#ea580c 30%,#ca8a04 46%,#65a30d 64%,#15803d 100%)' }}
          />
          {/* Tick marks between zones */}
          {ZONES.slice(1).map(z => (
            <div key={z.label} className="absolute left-0 right-0" style={{ bottom: toPct(z.floor) + '%', height: 1, background: 'rgba(0,0,0,0.45)' }} />
          ))}
        </div>

        {/* Pointer arrow */}
        <motion.div
          className="absolute flex items-center"
          style={{ right: 22 }}
          animate={{ bottom: `calc(${fillPct}% - 5px)` }}
          initial={{ bottom: `calc(${fillPct}% - 5px)` }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        >
          <div
            className="w-0 h-0"
            style={{
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderLeft: `7px solid ${color}`,
              filter: `drop-shadow(0 0 4px ${color})`,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
