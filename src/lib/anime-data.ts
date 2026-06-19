import { Anime, AnimeTier } from '@/types';

function tier(rating: number): AnimeTier {
  if (rating >= 9.0) return 'S';
  if (rating >= 8.0) return 'A';
  if (rating >= 7.0) return 'B';
  if (rating >= 6.0) return 'C';
  if (rating >= 5.0) return 'D';
  return 'F';
}

// 26 anime for the boxes — spread across all tiers like DoND case values
export const BOX_ANIME: Anime[] = [
  // S-tier (2) — jackpot equivalents
  {
    id: 'fmab',
    title: 'Fullmetal Alchemist: Brotherhood',
    rating: 9.2,
    tier: tier(9.2),
    genre: 'Action / Adventure',
    year: 2009,
    studio: 'Bones',
    description: 'Two brothers use alchemy to search for the Philosopher\'s Stone after a failed human transmutation.'
  },
  {
    id: 'steinsgate',
    title: 'Steins;Gate',
    rating: 9.1,
    tier: tier(9.1),
    genre: 'Sci-Fi / Thriller',
    year: 2011,
    studio: 'White Fox',
    description: 'A self-proclaimed mad scientist accidentally discovers time travel and faces the consequences.'
  },
  // A-tier (8) — strong pulls
  {
    id: 'hxh',
    title: 'Hunter x Hunter (2011)',
    rating: 8.9,
    tier: tier(8.9),
    genre: 'Action / Adventure',
    year: 2011,
    studio: 'Madhouse',
    description: 'A boy sets out to find his absent father and become a legendary Hunter.'
  },
  {
    id: 'aot',
    title: 'Attack on Titan',
    rating: 8.8,
    tier: tier(8.8),
    genre: 'Action / Dark Fantasy',
    year: 2013,
    studio: 'WIT / MAPPA',
    description: 'Humanity lives behind walls to survive against giant humanoid creatures.'
  },
  {
    id: 'demon_slayer',
    title: 'Demon Slayer',
    rating: 8.7,
    tier: tier(8.7),
    genre: 'Action / Supernatural',
    year: 2019,
    studio: 'ufotable',
    description: 'A boy becomes a demon slayer after his family is slaughtered and his sister turned into a demon.'
  },
  {
    id: 'deathnote',
    title: 'Death Note',
    rating: 8.6,
    tier: tier(8.6),
    genre: 'Psychological / Thriller',
    year: 2006,
    studio: 'Madhouse',
    description: 'A high school student discovers a supernatural notebook that kills anyone whose name is written in it.'
  },
  {
    id: 'code_geass',
    title: 'Code Geass',
    rating: 8.6,
    tier: tier(8.6),
    genre: 'Mecha / Political',
    year: 2006,
    studio: 'Sunrise',
    description: 'An exiled prince gains the power of absolute obedience and leads a rebellion.'
  },
  {
    id: 'vinland',
    title: 'Vinland Saga',
    rating: 8.5,
    tier: tier(8.5),
    genre: 'Historical / Action',
    year: 2019,
    studio: 'WIT Studio',
    description: 'A young Viking warrior seeks revenge in 11th century Europe.'
  },
  {
    id: 'mob_psycho',
    title: 'Mob Psycho 100',
    rating: 8.5,
    tier: tier(8.5),
    genre: 'Action / Supernatural',
    year: 2016,
    studio: 'Bones',
    description: 'An incredibly powerful psychic boy tries to live a normal life while suppressing his emotions.'
  },
  // B-tier (8) — solid but not elite
  {
    id: 'jjk',
    title: 'Jujutsu Kaisen',
    rating: 8.3,
    tier: tier(8.3),
    genre: 'Action / Supernatural',
    year: 2020,
    studio: 'MAPPA',
    description: 'A boy swallows a cursed finger to save classmates and enters a world of sorcerers.'
  },
  {
    id: 'mha',
    title: 'My Hero Academia',
    rating: 8.3,
    tier: tier(8.3),
    genre: 'Action / Superhero',
    year: 2016,
    studio: 'Bones',
    description: 'In a world where most people have superpowers, a powerless boy dreams of becoming a hero.'
  },
  {
    id: 'opm',
    title: 'One Punch Man',
    rating: 8.2,
    tier: tier(8.2),
    genre: 'Action / Comedy',
    year: 2015,
    studio: 'Madhouse',
    description: 'A hero who can defeat any opponent with a single punch searches for a worthy challenge.'
  },
  {
    id: 'rezero',
    title: 'Re:Zero',
    rating: 8.2,
    tier: tier(8.2),
    genre: 'Isekai / Psychological',
    year: 2016,
    studio: 'White Fox',
    description: 'A young man is transported to a fantasy world and discovers he can return from death.'
  },
  {
    id: 'promised_neverland',
    title: 'The Promised Neverland',
    rating: 8.0,
    tier: tier(8.0),
    genre: 'Thriller / Horror',
    year: 2019,
    studio: 'CloverWorks',
    description: 'Orphan children discover their idyllic home hides a dark secret.'
  },
  // B-tier lower (5) — recognizable, watchable
  {
    id: 'naruto',
    title: 'Naruto',
    rating: 7.9,
    tier: tier(7.9),
    genre: 'Action / Shonen',
    year: 2002,
    studio: 'Pierrot',
    description: 'A young ninja with a powerful spirit sealed inside him dreams of becoming Hokage.'
  },
  {
    id: 'dragonball_z',
    title: 'Dragon Ball Z',
    rating: 7.8,
    tier: tier(7.8),
    genre: 'Action / Shonen',
    year: 1989,
    studio: 'Toei Animation',
    description: 'Goku and his friends protect the Earth from powerful villains.'
  },
  {
    id: 'haikyuu',
    title: 'Haikyuu!!',
    rating: 7.8,
    tier: tier(7.8),
    genre: 'Sports / Drama',
    year: 2014,
    studio: 'Production I.G',
    description: 'A short boy with a dream of being a volleyball ace joins a powerhouse team.'
  },
  {
    id: 'black_clover',
    title: 'Black Clover',
    rating: 7.4,
    tier: tier(7.4),
    genre: 'Action / Fantasy',
    year: 2017,
    studio: 'Pierrot',
    description: 'A boy born without magic in a magic-dominated world aims to become the Wizard King.'
  },
  {
    id: 'fairy_tail',
    title: 'Fairy Tail',
    rating: 7.3,
    tier: tier(7.3),
    genre: 'Action / Fantasy',
    year: 2009,
    studio: 'A-1 Pictures',
    description: 'A wizard joins a rowdy guild of mages on wild adventures.'
  },
  // C-tier (4) — known but forgettable
  {
    id: 'tokyo_ghoul',
    title: 'Tokyo Ghoul',
    rating: 6.9,
    tier: tier(6.9),
    genre: 'Dark Fantasy / Horror',
    year: 2014,
    studio: 'Pierrot',
    description: 'A college student becomes half-ghoul after a deadly encounter with one.'
  },
  {
    id: 'sao',
    title: 'Sword Art Online',
    rating: 6.8,
    tier: tier(6.8),
    genre: 'Isekai / Action',
    year: 2012,
    studio: 'A-1 Pictures',
    description: 'Players are trapped in a deadly virtual reality game and must clear it to escape.'
  },
  {
    id: 'overlord',
    title: 'Overlord',
    rating: 6.8,
    tier: tier(6.8),
    genre: 'Isekai / Dark Fantasy',
    year: 2015,
    studio: 'Madhouse',
    description: 'A player is trapped as his avatar in a dark game world at server shutdown.'
  },
  {
    id: 'shield_hero',
    title: 'The Rising of the Shield Hero',
    rating: 6.7,
    tier: tier(6.7),
    genre: 'Isekai / Action',
    year: 2019,
    studio: 'Kinema Citrus',
    description: 'A young man summoned to a fantasy world is betrayed and forced to start from scratch.'
  },
  // D-tier (2) — rough watches
  {
    id: 'btooom',
    title: 'Btooom!',
    rating: 5.8,
    tier: tier(5.8),
    genre: 'Action / Survival',
    year: 2012,
    studio: 'Madhouse',
    description: 'A NEET is dropped on an island and forced to play a real-life version of his favorite bomb game.'
  },
  {
    id: 'asterisk_war',
    title: 'The Asterisk War',
    rating: 5.6,
    tier: tier(5.6),
    genre: 'Action / Harem',
    year: 2015,
    studio: 'A-1 Pictures',
    description: 'A transfer student enters a city of six academies that host battle tournaments.'
  },
  // F-tier (1) — the consolation prize
  {
    id: 'isekai_smartphone',
    title: 'Isekai wa Smartphone to Tomo ni',
    rating: 5.0,
    tier: tier(5.0),
    genre: 'Isekai / Harem',
    year: 2017,
    studio: 'Production Reed',
    description: 'A boy is reincarnated in a fantasy world with his smartphone still working.'
  },
];

// Separate offer pool — anime the banker uses for offers (not in boxes)
export const OFFER_POOL: Anime[] = [
  {
    id: 'gintama',
    title: 'Gintama',
    rating: 9.0,
    tier: tier(9.0),
    genre: 'Comedy / Action',
    year: 2006,
    studio: 'Sunrise',
    description: 'Samurai take odd jobs in an alien-occupied Edo Japan. A legendary comedy.'
  },
  {
    id: 'demon_slayer_mugen',
    title: 'Demon Slayer: Mugen Train',
    rating: 8.7,
    tier: tier(8.7),
    genre: 'Action / Supernatural',
    year: 2020,
    studio: 'ufotable',
    description: 'Tanjiro boards an infinite dream train to stop a demon preying on passengers.'
  },
  {
    id: 'your_name',
    title: 'Your Name',
    rating: 8.6,
    tier: tier(8.6),
    genre: 'Romance / Supernatural',
    year: 2016,
    studio: 'CoMix Wave Films',
    description: 'Two teenagers mysteriously swap bodies and try to find each other.'
  },
  {
    id: 'spirited_away',
    title: 'Spirited Away',
    rating: 8.5,
    tier: tier(8.5),
    genre: 'Fantasy / Adventure',
    year: 2001,
    studio: 'Studio Ghibli',
    description: 'A girl enters a spirit world and must work to free herself and her transformed parents.'
  },
  {
    id: 'princess_mononoke',
    title: 'Princess Mononoke',
    rating: 8.4,
    tier: tier(8.4),
    genre: 'Fantasy / Action',
    year: 1997,
    studio: 'Studio Ghibli',
    description: 'A young prince caught between the forces of nature and human civilization.'
  },
  {
    id: 'violet_evergarden',
    title: 'Violet Evergarden',
    rating: 8.2,
    tier: tier(8.2),
    genre: 'Drama / Fantasy',
    year: 2018,
    studio: 'Kyoto Animation',
    description: 'A war veteran learns to understand human emotion as an Auto Memory Doll.'
  },
  {
    id: 'made_in_abyss',
    title: 'Made in Abyss',
    rating: 8.2,
    tier: tier(8.2),
    genre: 'Adventure / Dark Fantasy',
    year: 2017,
    studio: 'Kinema Citrus',
    description: 'A girl and a robot boy descend into a mysterious, deadly chasm.'
  },
  {
    id: 'cowboy_bebop',
    title: 'Cowboy Bebop',
    rating: 8.1,
    tier: tier(8.1),
    genre: 'Sci-Fi / Neo-Noir',
    year: 1998,
    studio: 'Sunrise',
    description: 'A ragtag crew of bounty hunters travel through a future solar system.'
  },
  {
    id: 'neon_genesis',
    title: 'Neon Genesis Evangelion',
    rating: 8.1,
    tier: tier(8.1),
    genre: 'Mecha / Psychological',
    year: 1995,
    studio: 'Gainax',
    description: 'Teenagers pilot giant mechs against mysterious beings in a post-catastrophe world.'
  },
  {
    id: 'fate_zero',
    title: 'Fate/Zero',
    rating: 8.0,
    tier: tier(8.0),
    genre: 'Action / Dark Fantasy',
    year: 2011,
    studio: 'ufotable',
    description: 'Mages and their heroic spirits battle for the omnipotent Holy Grail.'
  },
  {
    id: 'sword_art_alicization',
    title: 'SAO: Alicization',
    rating: 7.5,
    tier: tier(7.5),
    genre: 'Isekai / Action',
    year: 2018,
    studio: 'A-1 Pictures',
    description: 'Kirito dives into a new VR world with a mission to protect two AIs.'
  },
  {
    id: 'tpn_s2',
    title: 'The Promised Neverland S2',
    rating: 6.5,
    tier: tier(6.5),
    genre: 'Thriller',
    year: 2021,
    studio: 'CloverWorks',
    description: 'The children escape and face new threats in the outside world. A divisive sequel.'
  },
  {
    id: 'infinite_stratos',
    title: 'Infinite Stratos',
    rating: 5.5,
    tier: tier(5.5),
    genre: 'Harem / Mecha',
    year: 2011,
    studio: '8bit',
    description: 'The only boy who can pilot advanced mecha suits is surrounded by fighting girls.'
  },
  {
    id: 'conception',
    title: 'Conception',
    rating: 5.0,
    tier: tier(5.0),
    genre: 'Isekai / Harem',
    year: 2018,
    studio: 'GONZO',
    description: 'A boy must father children with twelve star maidens to save a fantasy world.'
  },
];

export function getAnimeByRating(
  targetRating: number,
  pool: Anime[],
  tolerance = 1.5
): Anime | null {
  const candidates = pool.filter(
    a => Math.abs(a.rating - targetRating) <= tolerance
  );
  if (candidates.length === 0) return pool[0] ?? null;
  candidates.sort(
    (a, b) => Math.abs(a.rating - targetRating) - Math.abs(b.rating - targetRating)
  );
  return candidates[0];
}

export function getAnimeByTier(
  targetTier: AnimeTier,
  pool: Anime[]
): Anime | null {
  const matches = pool.filter(a => a.tier === targetTier);
  if (matches.length === 0) return null;
  return matches[Math.floor(Math.random() * matches.length)];
}
