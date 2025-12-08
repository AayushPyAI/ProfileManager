import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import ResumePDF from "@/components/resume";
import { getProfile } from "@/lib/profile";


export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get("profileId");

  if (!profileId) {
    return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
  }

  const profile = await getProfile(profileId);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const pdfBuffer = await renderToBuffer(<ResumePDF profile={profile} />);

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Resume_${profileId}.pdf"`,
    },
  });
}
