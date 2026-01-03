'use client';

import dynamic from 'next/dynamic';
import Skeleton from '../common/Skeleton';

const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center">
    <Skeleton className="w-full h-full rounded-xl" />
  </div>
});

export default function Map() {
  return <MapInner />;
}
