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

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      );
    }

    const rawUpdates = formData.get("updates");
    if (!rawUpdates) {
      return NextResponse.json(
        { error: "No update data provided" },
        { status: 400 }
      );
    }

    const updates = JSON.parse(rawUpdates);
    
    // Validate updates structure
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Avatar handling with validation
    const avatarFile = formData.get("avatar");
    if (avatarFile && avatarFile.size > 0) {
      if (avatarFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Avatar file too large (max 5MB)" },
          { status: 400 }
        );
      }
      
      if (!avatarFile.type.startsWith('image/')) {
        return NextResponse.json(
          { error: "Only image files allowed for avatar" },
          { status: 400 }
        );
      }
      
      updates.avatarBuffer = Buffer.from(await avatarFile.arrayBuffer());
      updates.avatarFileName = avatarFile.name;
    }

    const updatedProfile = await updateProfile(
      profileId,
      updates,
      user._id.toString()
    );

    if (!updatedProfile) {
      return NextResponse.json(
        { error: "Profile not found or unauthorized" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Profile updated", profile: updatedProfile },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
