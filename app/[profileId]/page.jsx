export const revalidate = 300;

import { notFound } from "next/navigation";
import PortfolioClient from "@/components/portofolio/PortfolioClient";
import { use } from "react";
import { getProfile } from "@/lib/profile";

function getParams(paramsPromise) {
  return use(paramsPromise);
}

export default function PortfolioPage({ params }) {
  const { profileId } = getParams(params);

  if (!profileId) notFound();

  return <ServerProfile profileId={profileId} />;
}

async function ServerProfile({ profileId }) {
  let profile;

  try {
    profile = await getProfile(profileId);
  } catch (err) {
    console.error("ServerProfile DB error:", err);
  }

  if (!profile) notFound();

  const plainProfile = JSON.parse(JSON.stringify(profile));

  // ✅ JSX OUTSIDE try/catch
  return (
    <PortfolioClient
      profileId={profileId}
      profile={plainProfile}
    />
  );
}
