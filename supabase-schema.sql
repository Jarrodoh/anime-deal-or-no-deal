-- Run this in your Supabase SQL editor to create the required tables

-- Leaderboard
create table if not exists public.game_results (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  anime_title text not null,
  anime_rating numeric(4,2) not null,
  anime_tier char(1) not null,
  accepted_deal boolean not null default false,
  round_ended int not null default 1,
  date date not null,
  duration_seconds int not null default 0,
  created_at timestamptz not null default now()
);

-- Party rooms
create table if not exists public.party_rooms (
  id uuid primary key default gen_random_uuid(),
  code char(6) unique not null,
  host_id text not null,
  host_name text not null,
  game_state jsonb,
  votes jsonb default '[]'::jsonb,
  status text not null default 'waiting',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '4 hours')
);

-- Party participants
create table if not exists public.party_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.party_rooms(id) on delete cascade,
  player_id text not null,
  player_name text not null,
  role text not null default 'audience',
  joined_at timestamptz not null default now(),
  unique(room_id, player_id)
);

-- Indexes
create index if not exists idx_game_results_date on public.game_results(date);
create index if not exists idx_game_results_rating on public.game_results(anime_rating desc);
create index if not exists idx_party_rooms_code on public.party_rooms(code);

-- Row Level Security
alter table public.game_results enable row level security;
alter table public.party_rooms enable row level security;
alter table public.party_participants enable row level security;

-- Public read policies
create policy "Anyone can read leaderboard" on public.game_results for select using (true);
create policy "Anyone can insert leaderboard" on public.game_results for insert with check (true);
create policy "Anyone can read rooms" on public.party_rooms for select using (true);
create policy "Anyone can create rooms" on public.party_rooms for insert with check (true);
create policy "Anyone can update rooms" on public.party_rooms for update using (true);
create policy "Anyone can read participants" on public.party_participants for select using (true);
create policy "Anyone can join" on public.party_participants for insert with check (true);

-- Auto-clean expired rooms (run this as a cron job or scheduled function)
-- delete from public.party_rooms where expires_at < now();
