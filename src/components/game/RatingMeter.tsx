'use client';

import { motion } from 'framer-motion';

interface RatingMeterProps {
  value: number; // current board expected value (4–10)
}

const MIN = 4.0;
const MAX = 10.0;
const BAR_H = 220; // px

// Zones ordered top → bottom (highest first)
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

export default function RatingMeter({ value }: RatingMeterProps) {
  const fillPct = toPct(value);
  const color = zoneColor(value);

  return (
    <div className="flex flex-col items-center" style={{ width: 64 }}>
      <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2">EV</p>

      {/* Bar + labels wrapper */}
      <div className="relative" style={{ height: BAR_H, width: 64 }}>

        {/* Zone labels — absolutely positioned at midpoint of each zone */}
        {ZONES.map((z, i) => {
          const floorPct = toPct(z.floor);
          const ceilPct = i === 0 ? 100 : toPct(ZONES[i - 1].floor);
          const midPct = (floorPct + ceilPct) / 2;
          const bottomPx = (midPct / 100) * BAR_H - 6;
          return (
            <span
              key={z.label}
              className="absolute text-[8px] font-black text-right leading-none"
              style={{ color: z.color + 'cc', bottom: bottomPx, left: 0, width: 30 }}
            >
              {z.label}
            </span>
          );
        })}

        {/* Bar track */}
        <div
          className="absolute right-0 rounded-full overflow-hidden"
          style={{ width: 22, top: 0, bottom: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Faint full-gradient background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, #7f1d1d 0%, #dc2626 14%, #ea580c 30%, #ca8a04 46%, #65a30d 64%, #15803d 100%)',
              opacity: 0.18,
            }}
          />

          {/* Active fill from bottom */}
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            animate={{ height: fillPct + '%' }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
            style={{
              background: 'linear-gradient(to top, #7f1d1d 0%, #dc2626 14%, #ea580c 30%, #ca8a04 46%, #65a30d 64%, #15803d 100%)',
            }}
          />

          {/* Zone tick marks */}
          {ZONES.slice(1).map(z => (
            <div
              key={z.label}
              className="absolute left-0 right-0"
              style={{
                bottom: toPct(z.floor) + '%',
                height: 1,
                background: 'rgba(0,0,0,0.5)',
              }}
            />
          ))}
        </div>

        {/* Animated pointer arrow */}
        <motion.div
          className="absolute right-6 flex items-center gap-0.5"
          animate={{ bottom: 'calc(' + fillPct + '% - 8px)' }}
          initial={{ bottom: 'calc(' + fillPct + '% - 8px)' }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        >
          <span
            className="text-[10px] font-black tabular-nums whitespace-nowrap"
            style={{ color }}
          >
            {value.toFixed(1)}
          </span>
          {/* Arrow pointing right toward the bar */}
          <div
            className="w-0 h-0 flex-shrink-0"
            style={{
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderLeft: `6px solid ${color}`,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
