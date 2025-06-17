'use client';

import dynamic from 'next/dynamic';

const HomeContent = dynamic(() => import('../app/HomeContent'), {
  ssr: false
});

export default function ClientHomeWrapper() {
  return <HomeContent />;
}
