import { NextResponse } from "next/server";
import { deleteProfile } from "@/lib/profile";
import { authenticateRequest } from "@/lib/apiAuth.js";

export async function POST(req) {
  try {
    // Authenticate user
    const { error, user } = await authenticateRequest(req);
    if (error) return error;

    // Parse incoming JSON
    const { profileId } = await req.json();

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      );
    }

    // Delete profile + avatar (handled in deleteProfile)
    const deleted = await deleteProfile(profileId, user._id.toString());

    if (!deleted) {
      return NextResponse.json(
        { error: "Profile not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Profile deleted successfully", deleted: true },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
