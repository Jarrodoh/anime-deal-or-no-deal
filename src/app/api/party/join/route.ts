import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { code, player_name, player_id } = body;

  if (!code || !player_name || !player_id) {
    return NextResponse.json({ error: 'code, player_name, player_id required' }, { status: 400 });
  }

  const sanitizedName = String(player_name).slice(0, 30).replace(/[<>"']/g, '');

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ data: { joined: true, code: code.toUpperCase() } });
  }

  const { data: room, error: roomErr } = await supabase
    .from('party_rooms')
    .select('id, status')
    .eq('code', code.toUpperCase())
    .single();

  if (roomErr || !room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }
  if (room.status === 'finished') {
    return NextResponse.json({ error: 'Room is finished' }, { status: 400 });
  }

  const participant = {
    id: crypto.randomUUID(),
    room_id: room.id,
    player_id: String(player_id).slice(0, 40),
    player_name: sanitizedName,
    role: 'audience',
    joined_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('party_participants').upsert(participant, { onConflict: 'room_id,player_id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: { joined: true, code: code.toUpperCase() } });
}
