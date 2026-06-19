import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// In-memory fallback when Supabase is not configured
const memoryStore: Array<Record<string, unknown>> = [];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);

  if (!isSupabaseConfigured()) {
    const filtered = date
      ? memoryStore.filter(e => e.date === date)
      : memoryStore;
    const sorted = [...filtered]
      .sort((a, b) => (b.anime_rating as number) - (a.anime_rating as number))
      .slice(0, limit);
    return NextResponse.json({ data: sorted });
  }

  let query = supabase
    .from('game_results')
    .select('*')
    .order('anime_rating', { ascending: false })
    .limit(limit);

  if (date) query = query.eq('date', date);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const { player_name, anime_title, anime_rating, anime_tier, accepted_deal, round_ended, date, duration_seconds } = body;

  if (!player_name || !anime_title || anime_rating === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const sanitized = {
    player_name: String(player_name).slice(0, 40).replace(/[<>"']/g, ''),
    anime_title: String(anime_title).slice(0, 100),
    anime_rating: Math.max(0, Math.min(10, Number(anime_rating))),
    anime_tier: String(anime_tier ?? 'C').slice(0, 1),
    accepted_deal: Boolean(accepted_deal),
    round_ended: Math.max(1, Math.min(20, parseInt(round_ended ?? 1))),
    date: String(date ?? new Date().toISOString().slice(0, 10)).slice(0, 10),
    duration_seconds: Math.max(0, parseInt(duration_seconds ?? 0)),
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    const entry = { id: crypto.randomUUID(), ...sanitized };
    memoryStore.push(entry);
    if (memoryStore.length > 1000) memoryStore.shift();
    return NextResponse.json({ data: entry });
  }

  const { data, error } = await supabase.from('game_results').insert(sanitized).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
