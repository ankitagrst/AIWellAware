
"use client";

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export type UserProfile = {
  name: string;
  email: string;
  age: string;
  lifestyle: string;
  preferences: string;
  healthGoals: string;
};

const ProfileForm = dynamic(() => import('@/components/features/profile-form'), {
  ssr: false,
  loading: () => <ProfileSkeleton />,
});

const ProfileSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
        </CardContent>
    </Card>
);

export default function ProfilePage() {

  return (
    <main className="flex flex-1 flex-col items-center justify-start p-4 md:p-6">
       <div className="w-full max-w-2xl">
         <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold md:text-3xl font-headline">User Profile</h1>
         </div>
         <ProfileForm />
      </div>
    </main>
  );
}
