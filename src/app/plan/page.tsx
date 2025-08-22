
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const DailyPlanGenerator = dynamic(
  () => import('@/components/features/daily-plan-generator').then(mod => mod.DailyPlanGenerator),
  { 
    ssr: false,
    loading: () => <DailyPlanSkeleton />
  }
);

const DailyPlanSkeleton = () => (
    <div className="w-full max-w-4xl">
        <Skeleton className="h-40 w-full" />
    </div>
);

export default function PlanPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-start p-4 md:p-6">
       <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold md:text-3xl font-headline">Your Daily Wellness Plan</h1>
        </div>
        <DailyPlanGenerator />
      </div>
    </main>
  );
}
