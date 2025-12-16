import { NextResponse } from 'next/server';
import { getProfilesByUser, countUserProfiles } from '@/lib/profile.js';
import { authenticateRequest } from '@/lib/apiAuth.js';

export async function GET(req) {
  try {
    const { error, user } = await authenticateRequest(req);
    if (error) return error;
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 5;
    
const [profiles, total] = await Promise.all([
  getProfilesByUser(user._id.toString(), page, limit), 
  countUserProfiles(user._id.toString())
]);
    
    return NextResponse.json({ 
      profiles,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      success: true 
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error, success: false }, { status: 500 });
  }
}

export async function POST(req) {
  return GET(req);
}