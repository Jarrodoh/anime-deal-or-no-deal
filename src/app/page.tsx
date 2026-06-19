import Link from 'next/link';
import { getTodayString } from '@/lib/daily-seed';

export default function Home() {
  const today = getTodayString();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,215,0,0.04) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-lg text-center relative z-10">
        <div className="mb-3">
          <span className="text-xs text-white/30 uppercase tracking-widest font-semibold">
            Daily Anime Game
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black mb-2 leading-tight">
          <span className="shimmer-gold">Anime</span>
          <br />
          <span className="text-white">Deal or No Deal</span>
        </h1>

        <p className="text-white/50 text-sm md:text-base mb-2 max-w-sm mx-auto leading-relaxed">
          26 boxes. Each hides an anime — from legendary to unwatchable. Will you trust the banker?
        </p>

        <p className="text-white/25 text-xs mb-10">Today&apos;s board: {today}</p>

        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Link
            href="/game"
            className="py-4 rounded-2xl font-black text-xl uppercase tracking-wide border border-yellow-400/50 text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/18 transition-all text-center glow-gold"
          >
            Play Today&apos;s Board
          </Link>
          <Link
            href="/party"
            className="py-3 rounded-2xl font-bold text-base border border-white/15 text-white/70 hover:border-white/30 hover:text-white transition-all text-center"
          >
            Party Mode
          </Link>
          <Link
            href="/leaderboard"
            className="py-3 rounded-2xl font-bold text-base border border-white/8 text-white/40 hover:border-white/20 hover:text-white/70 transition-all text-center"
          >
            Leaderboard
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 text-left max-w-sm mx-auto">
          {[
            { step: '1', title: 'Pick a box', body: 'Choose one of 26 boxes to hold. Its anime stays hidden.' },
            { step: '2', title: 'Eliminate boxes', body: 'Open other boxes to reveal and eliminate their anime.' },
            { step: '3', title: 'Deal or No Deal', body: 'The banker offers a known anime. Accept or gamble on.' },
          ].map(s => (
            <div key={s.step} className="space-y-1">
              <div className="text-yellow-400 font-black text-xs">STEP {s.step}</div>
              <p className="text-white text-xs font-bold">{s.title}</p>
              <p className="text-white/40 text-xs leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
