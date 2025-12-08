import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/apiAuth";
import { updateProfile } from "@/lib/profile";
import { Buffer } from "buffer";

export async function PATCH(req) {
  try {
    const { error, user } = await authenticateRequest(req);
    if (error) return error;

    const formData = await req.formData();

    const profileId = formData.get("profileId");
    if (!profileId)
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });

    const rawUpdates = formData.get("updates");
    const updates = rawUpdates ? JSON.parse(rawUpdates) : {};

    // Avatar handling
    const avatarFile = formData.get("avatar");
    if (avatarFile && avatarFile.size > 0) {
      updates.avatarBuffer = Buffer.from(await avatarFile.arrayBuffer());
      updates.avatarFileName = avatarFile.name;
    }
    const updatedProfile = await updateProfile(
      profileId,
      updates,
      user._id.toString()
    );

    return NextResponse.json(
      { message: "Profile updated", profile: updatedProfile },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
