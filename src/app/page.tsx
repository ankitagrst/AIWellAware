
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const RitualGenerator = dynamic(
  () => import('@/components/features/ritual-generator').then(mod => mod.RitualGenerator),
  { 
    ssr: false,
    loading: () => <RitualGeneratorSkeleton /> 
  }
);

const RitualGeneratorSkeleton = () => (
  <div className="w-full max-w-4xl space-y-8">
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);


export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-start p-4 md:p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold md:text-3xl font-headline">
            Personalized Ritual Generator
          </h1>
        </div>
        <RitualGenerator />
      </div>
    </main>
  );
}
