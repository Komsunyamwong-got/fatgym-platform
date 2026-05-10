"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, ChevronRight, ChevronLeft, Target, Activity, Heart, Apple, Ruler, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveOnboarding } from "@/app/actions/onboarding";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const steps = [
  { id: "goal", title: "Goal Setting", icon: Target },
  { id: "posture", title: "Posture Analysis", icon: Activity },
  { id: "par-q", title: "Health Screening", icon: Heart },
  { id: "nutrition", title: "Nutrition Profile", icon: Apple },
  { id: "measurements", title: "Measurements", icon: Ruler },
  { id: "summary", title: "Summary", icon: FileCheck },
];

export default function OnboardingWizard({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    goals: { mainGoal: "Fat Loss", targetValue: "", targetDate: "" },
    parq: {},
    nutrition: { calories: "", protein: "", carbs: "" },
    measurements: { weight: "", bmi: "", bodyFat: "", chest: "", waist: "", hips: "" },
  });

  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const next = () => setCurrentStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const prev = () => setCurrentStepIndex((i) => Math.max(i - 1, 0));

  const handleSave = async () => {
    const res = await saveOnboarding(memberId, formData);
    if (res.success) {
      toast.success("Onboarding completed!");
      router.push(`/members/${memberId}`);
    } else {
      toast.error("Failed to save data");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Client Onboarding</h2>
          <span className="text-sm font-medium text-muted-foreground">Step {currentStepIndex + 1} of {steps.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="animate-in slide-in-from-bottom-4 duration-500">
        {currentStepIndex === 0 && (
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Main Fitness Goal</CardTitle>
              <CardDescription>What is the primary reason for joining FAT GYM?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["Fat Loss", "Muscle Gain", "Functional Fitness", "Strength", "Rehab", "Sports"].map((goal) => (
                  <div 
                    key={goal} 
                    onClick={() => setFormData({ ...formData, goals: { ...formData.goals, mainGoal: goal } })}
                    className={cn(
                      "p-4 rounded-xl border-2 cursor-pointer transition-all",
                      formData.goals.mainGoal === goal ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    )}
                  >
                    <h4 className="font-bold">{goal}</h4>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Input 
                  type="date" 
                  value={formData.goals.targetDate} 
                  onChange={(e) => setFormData({ ...formData, goals: { ...formData.goals, targetDate: e.target.value } })} 
                />
              </div>
            </CardContent>
          </Card>
        )}
        
        {currentStepIndex === 3 && (
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle>Nutrition Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Calories</Label>
                  <Input 
                    value={formData.nutrition.calories} 
                    onChange={(e) => setFormData({ ...formData, nutrition: { ...formData.nutrition, calories: e.target.value } })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Protein (g)</Label>
                  <Input 
                    value={formData.nutrition.protein} 
                    onChange={(e) => setFormData({ ...formData, nutrition: { ...formData.nutrition, protein: e.target.value } })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Carbs (g)</Label>
                  <Input 
                    value={formData.nutrition.carbs} 
                    onChange={(e) => setFormData({ ...formData, nutrition: { ...formData.nutrition, carbs: e.target.value } })} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStepIndex === 4 && (
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle>Measurements</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {Object.keys(formData.measurements).map((key) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key}</Label>
                  <Input 
                    value={formData.measurements[key as keyof typeof formData.measurements]} 
                    onChange={(e) => setFormData({ ...formData, measurements: { ...formData.measurements, [key]: e.target.value } })} 
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {currentStepIndex === 5 && (
          <Card className="border-none shadow-sm text-center p-8">
            <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Ready to Save!</CardTitle>
            <Button onClick={handleSave} className="mt-6 w-full h-12">Finish Onboarding</Button>
          </Card>
        )}
      </div>

      <div className="flex justify-between gap-4 mt-8">
        <Button variant="outline" onClick={prev} disabled={currentStepIndex === 0}>Back</Button>
        {currentStepIndex < steps.length - 1 && (
          <Button onClick={next}>Continue <ChevronRight className="w-4 h-4 ml-2" /></Button>
        )}
      </div>
    </div>
  );
}
