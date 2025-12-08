import { NextResponse } from 'next/server';
import { deleteProfileField, getProfile } from '../../../../lib/profile.js';
import { authenticateRequest } from '@/lib/apiAuth.js';

export async function PATCH(req) {
  try {
    // Authenticate the request
    const { error, user } = await authenticateRequest(req);
    
    if (error) {
      return error;
    }

    const body = await req.json();
    const { profileId, field, itemIdOrValue } = body;

    if (!profileId || !field || !itemIdOrValue) {
      return NextResponse.json({ error: 'profileId, field, and itemIdOrValue are required' }, { status: 400 });
    }

    // Verify profile ownership
    const profile = await getProfile(profileId);
    if (!profile || profile.user.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized - Profile not found or access denied' }, { status: 403 });
    }

    const updatedProfile = await deleteProfileField(profileId, field, itemIdOrValue);
    return NextResponse.json({ message: 'Field item deleted', profile: updatedProfile });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error }, { status: 500 });
  }
}