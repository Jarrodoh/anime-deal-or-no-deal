import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const rooms = new Map<string, Record<string, unknown>>();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  if (!isSupabaseConfigured()) {
    const room = rooms.get(code.toUpperCase());
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    return NextResponse.json({ data: room });
  }

  const { data, error } = await supabase
    .from('party_rooms')
    .select('*, party_participants(*)')
    .eq('code', code.toUpperCase())
    .single();

  if (error || !data) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const body = await req.json().catch(() => ({}));

  if (!isSupabaseConfigured()) {
    const room = rooms.get(code.toUpperCase());
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    const updated = { ...room, ...body };
    rooms.set(code.toUpperCase(), updated);
    return NextResponse.json({ data: updated });
  }

  const sanitized: Record<string, unknown> = {};
  if (body.game_state !== undefined) sanitized.game_state = body.game_state;
  if (body.status !== undefined) sanitized.status = String(body.status);
  if (body.votes !== undefined) sanitized.votes = Array.isArray(body.votes) ? body.votes : [];

  const { data, error } = await supabase
    .from('party_rooms')
    .update(sanitized)
    .eq('code', code.toUpperCase())
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
