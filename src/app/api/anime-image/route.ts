import { NextRequest, NextResponse } from 'next/server';

// In-memory cache so repeated requests don't re-hit AniList each time.
const cache = new Map<number, string | null>();

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('id');
  const id = raw ? parseInt(raw, 10) : NaN;

  if (!id || isNaN(id) || id <= 0) {
    return NextResponse.json({ url: null }, { status: 400 });
  }

  const cacheHeaders = { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' };

  if (cache.has(id)) {
    return NextResponse.json({ url: cache.get(id) ?? null }, { headers: cacheHeaders });
  }

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      // medium cover loads faster than large — smaller file, same CDN
      body: JSON.stringify({
        query: 'query ($id: Int) { Media(id: $id, type: ANIME) { coverImage { medium } } }',
        variables: { id },
      }),
    });

    const data = await res.json();
    const url: string | null = data?.data?.Media?.coverImage?.medium ?? null;
    cache.set(id, url);

    return NextResponse.json({ url }, { headers: cacheHeaders });
  } catch {
    cache.set(id, null);
    return NextResponse.json({ url: null });
  }
}
