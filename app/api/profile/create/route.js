import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/apiAuth";
import { createProfile } from "@/lib/profile";
import { Buffer } from "buffer";

export async function POST(req) {
  try {
    const { error, user } = await authenticateRequest(req);
    if (error) return error;

    const formData = await req.formData();

    const rawData = formData.get("data");
    const data = rawData ? JSON.parse(rawData) : {};

    if (!data.personal?.name?.trim()) {
      return NextResponse.json(
        { error: "Profile name is required" },
        { status: 400 }
      );
    }

    const avatarFile = formData.get("avatar");

    if (avatarFile && avatarFile.size > 0) {
      if (avatarFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Avatar file too large (max 5MB)" },
          { status: 400 }
        );
      }

      data.avatarBuffer = Buffer.from(await avatarFile.arrayBuffer());
      data.avatarFileName = avatarFile.name;
    }

    const profile = await createProfile(user._id.toString(), data);

    return NextResponse.json(
      { message: "Profile created", profile },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
