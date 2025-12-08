import { notFound } from 'next/navigation';
import PortfolioClient from '@/components/portofolio/PortfolioClient';
import { use } from 'react';

function getParams(paramsPromise) {
  return use(paramsPromise);
}

// DO NOT make this page async
export default function PortfolioPage({ params }) {
  const { profileId } = getParams(params); // unwrap params Promise here

  if (!profileId) notFound();

  // fetch MUST be done inside a child async component
  return <ServerProfile profileId={profileId} />;
}

// Separate async server component only for data fetching
async function ServerProfile({ profileId }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/profile/get`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId }),
    cache: 'no-store',
  });

  if (!res.ok) notFound();

  const data = await res.json();
  const profile = data?.profile ?? null;

  return <PortfolioClient profileId={profileId} profile={profile} />;
}
