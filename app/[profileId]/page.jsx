import { notFound } from "next/navigation";
import PortfolioClient from "@/components/portofolio/PortfolioClient";
import { use } from "react";
import { getProfile } from "@/lib/profile";

function getParams(paramsPromise) {
  return use(paramsPromise);
}

// DO NOT make this page async
export default function PortfolioPage({ params }) {
  const { profileId } = getParams(params);

  if (!profileId) notFound();

  return <ServerProfile profileId={profileId} />;
}

// Async Server Component for DB fetching
async function ServerProfile({ profileId }) {
  try {
    const profile = await getProfile(profileId);
    if (!profile) notFound();

    const plainProfile = JSON.parse(JSON.stringify(profile));

    return <PortfolioClient profileId={profileId} profile={plainProfile} />;
  } catch (err) {
    console.error("ServerProfile DB error:", err);
    notFound();
  }
}
