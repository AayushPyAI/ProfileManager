import { NextResponse } from 'next/server';
import { getProfilesByUser } from '@/lib/profile.js';
import { authenticateRequest } from '@/lib/apiAuth.js';

export async function POST(req) {
  try {
    // Authenticate the request
    const { error, user } = await authenticateRequest(req);
    
    if (error) {
      return error;
    }

    // Use authenticated user's ID instead of request body
    const profiles = await getProfilesByUser(user._id.toString());
    return NextResponse.json({ profile: profiles, profiles });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error }, { status: 500 });
  }
}