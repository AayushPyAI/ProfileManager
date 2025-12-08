import { NextResponse } from 'next/server';
import { searchProfiles } from '../../../../lib/profile.js';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const params = {
      name: url.searchParams.get('name') || undefined,
      location: url.searchParams.get('location') || undefined,
      skill: url.searchParams.get('skill') || undefined,
      email: url.searchParams.get('email') || undefined,
      page: url.searchParams.get('page') ? parseInt(url.searchParams.get('page')) : 1,
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')) : 10,
    };

    const results = await searchProfiles(params);
    return NextResponse.json(results);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error }, { status: 500 });
  }
}
