
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export type UserProfile = {
  name: string;
  email: string;
  age: string;
  lifestyle: string;
  preferences: string;
  healthGoals: string;
};

const defaultProfile: UserProfile = {
    name: "Alex Doe",
    email: "alex.doe@example.com",
    age: "30",
    lifestyle: "",
    preferences: "Prefers morning yoga, interested in stress reduction techniques, and enjoys guided meditation.",
    healthGoals: "Improve sleep quality, reduce stress, build a consistent fitness routine.",
};

export default function ProfileForm() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // This effect runs only on the client
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfile(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveChanges = () => {
    try {
        localStorage.setItem("userProfile", JSON.stringify(profile));
        toast({
          title: "Success!",
          description: "Your profile has been saved.",
        });
    } catch (error) {
        console.error("Failed to save profile to localStorage", error);
        toast({
            variant: "destructive",
            title: "Error!",
            description: "Could not save your profile.",
        });
    }
  };

  if (!isLoaded) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
        </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Information</CardTitle>
        <CardDescription>
          This information helps your AI Wellness Coach personalize its recommendations for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={profile.name} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={profile.email} onChange={handleInputChange} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input id="age" value={profile.age} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lifestyle">Lifestyle</Label>
            <Input id="lifestyle" placeholder="e.g., Sedentary, Active" value={profile.lifestyle} onChange={handleInputChange} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferences">Wellness Preferences</Label>
          <Textarea
            id="preferences"
            value={profile.preferences}
            onChange={handleInputChange}
            rows={3}
            placeholder="Describe your wellness interests..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="healthGoals">Health Goals</Label>
          <Textarea
            id="healthGoals"
            value={profile.healthGoals}
            onChange={handleInputChange}
            rows={3}
            placeholder="What are your main health and wellness goals?"
          />
        </div>
        <Button className="w-full" onClick={handleSaveChanges}>Save Changes</Button>
      </CardContent>
    </Card>
  );
}
