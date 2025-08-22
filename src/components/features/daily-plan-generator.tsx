
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { generateDailyPlanAction } from "@/app/actions";
import type { GenerateDailyPlanOutput } from "@/ai/flows/generate-daily-plan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Sun, Sunset, Coffee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/app/profile/page";

type State = {
  success: boolean;
  data?: GenerateDailyPlanOutput;
  error?: string;
} | null;

const initialState: State = null;

const PlanSection = ({ title, icon: Icon, data }: { title: string, icon: React.ElementType, data: GenerateDailyPlanOutput['morning'] }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Icon className="text-primary" />
                {title}
            </CardTitle>
            <CardDescription>{data.description}</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="list-disc pl-5 space-y-2">
                {data.activities.map((activity, index) => (
                    <li key={index}>{activity}</li>
                ))}
            </ul>
        </CardContent>
    </Card>
);

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" size="lg" className="w-full max-w-xs" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Plan...
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate My Daily Plan
                </>
            )}
        </Button>
    )
}

export function DailyPlanGenerator() {
  const [state, formAction] = useActionState(generateDailyPlanAction, initialState);
  const { toast } = useToast();
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
        const savedProfile = localStorage.getItem("userProfile");
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        }
    } catch (error) {
        console.error("Failed to load profile from localStorage", error);
    }
    setIsLoaded(true);
  }, []);
  
  useEffect(() => {
    if (state?.error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: state.error,
        });
    }
  }, [state, toast]);

  if (!isLoaded) {
    return (
      <div className="w-full max-w-4xl text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!profile.healthGoals || !profile.preferences) {
    return (
        <Card className="w-full max-w-2xl text-center">
            <CardHeader>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>
                    Please complete your health goals and wellness preferences on the Profile page to generate a daily plan.
                </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
                <Button asChild>
                    <Link href="/profile">Go to Profile</Link>
                </Button>
            </CardFooter>
        </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl space-y-8">
        {!state?.data && (
            <form action={() => formAction({ healthGoals: profile.healthGoals!, preferences: profile.preferences!, lifestyle: profile.lifestyle })}>
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle>Ready for Your Wellness Plan?</CardTitle>
                        <CardDescription>
                            Click the button below to generate a personalized wellness plan for your day based on your profile.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SubmitButton />
                    </CardContent>
                </Card>
            </form>
        )}
      
      {state?.success && state.data && (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <PlanSection title="Morning" icon={Coffee} data={state.data.morning} />
            <PlanSection title="Afternoon" icon={Sun} data={state.data.afternoon} />
            <PlanSection title="Evening" icon={Sunset} data={state.data.evening} />
            <div className="text-center">
                 <form action={() => formAction({ healthGoals: profile.healthGoals!, preferences: profile.preferences!, lifestyle: profile.lifestyle })}>
                    <SubmitButton />
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
