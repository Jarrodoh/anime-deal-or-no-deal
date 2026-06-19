import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// In-memory fallback
const rooms = new Map<string, Record<string, unknown>>();

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { host_name, host_id } = body;

  if (!host_name || !host_id) {
    return NextResponse.json({ error: 'host_name and host_id are required' }, { status: 400 });
  }

  const code = generateCode();
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

  const room = {
    id: crypto.randomUUID(),
    code,
    host_id: String(host_id).slice(0, 40),
    host_name: String(host_name).slice(0, 30).replace(/[<>"']/g, ''),
    game_state: null,
    votes: [],
    status: 'waiting',
    created_at: now,
    expires_at: expiresAt,
  };

  if (!isSupabaseConfigured()) {
    rooms.set(code, room);
    setTimeout(() => rooms.delete(code), 4 * 60 * 60 * 1000);
    return NextResponse.json({ data: { code, room } });
  }

  const { data, error } = await supabase.from('party_rooms').insert(room).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { code, room: data } });
}
