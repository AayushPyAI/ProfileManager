import { NextResponse } from 'next/server';
import { updateUser } from '@/lib/user.js';
import { authenticateRequest } from '@/lib/apiAuth.js';

export async function PATCH(req) {
  try {
    // Authenticate the request
    const { error, user } = await authenticateRequest(req);
    
    if (error) {
      return error;
    }

    const formData = await req.formData();
    const name = formData.get("name");
    const email = formData.get("email");
    const avatarFile = formData.get("avatar");

    const updatePayload = { name, email };

    if (avatarFile && avatarFile.size > 0) {
      updatePayload.avatarBuffer = Buffer.from(await avatarFile.arrayBuffer());
      updatePayload.avatarFileName = avatarFile.name;
    }

    // Use authenticated user's ID
    const updatedUser = await updateUser(user._id.toString(), updatePayload);

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
