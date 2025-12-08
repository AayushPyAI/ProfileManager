import { NextResponse } from 'next/server';
import { deleteProfile, getProfile } from '../../../../lib/profile.js';
import { authenticateRequest } from '@/lib/apiAuth.js';

// GET is public (for viewing portfolios)
export async function GET(req, context) {
  const resolvedParams = 'then' in context.params ? await context.params : context.params;
  const { profileId } = resolvedParams;

  const profile = await getProfile(profileId);
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }
  return NextResponse.json({ profile });
}

// DELETE requires authentication
export async function DELETE(req, context) {
  try {
    // Authenticate the request
    const { error, user } = await authenticateRequest(req);
    
    if (error) {
      return error;
    }

    const resolvedParams = 'then' in context.params ? await context.params : context.params;
    const { profileId } = resolvedParams;

    if (!profileId)
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });

    // Use authenticated user's ID to ensure ownership
    const deleted = await deleteProfile(profileId, user._id.toString());
    return NextResponse.json({
      message: deleted ? 'Profile deleted' : 'Profile not found',
      deleted,
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error }, { status: 500 });
  }
}