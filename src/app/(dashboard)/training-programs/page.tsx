"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Clock, 
  Dumbbell, 
  ChevronRight, 
  Plus, 
  Copy, 
  Calendar,
  Users,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

const programs = [
  {
    id: "P001",
    name: "Fat Loss Beginner",
    goal: "Fat Loss",
    level: "Beginner",
    duration: "12 Weeks",
    sessions: 36,
    activeClients: 15,
    lastUpdated: "2024-05-01",
    color: "from-orange-500/10 to-orange-500/5 text-orange-600",
  },
  {
    id: "P002",
    name: "Strength Foundation",
    goal: "Strength",
    level: "Intermediate",
    duration: "8 Weeks",
    sessions: 24,
    activeClients: 8,
    lastUpdated: "2024-04-20",
    color: "from-blue-500/10 to-blue-500/5 text-blue-600",
  },
  {
    id: "P003",
    name: "Muscle Gain Pro",
    goal: "Muscle Gain",
    level: "Advanced",
    duration: "16 Weeks",
    sessions: 64,
    activeClients: 5,
    lastUpdated: "2024-05-05",
    color: "from-purple-500/10 to-purple-500/5 text-purple-600",
  },
  {
    id: "P004",
    name: "HYROX Preparation",
    goal: "Performance",
    level: "Intermediate",
    duration: "10 Weeks",
    sessions: 40,
    activeClients: 12,
    lastUpdated: "2024-05-08",
    color: "from-green-500/10 to-green-500/5 text-green-600",
  },
];

export default function TrainingProgramsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Training Programs</h2>
          <p className="text-muted-foreground text-sm">Manage program templates and client assignments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Copy className="w-4 h-4" /> Import
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> New Program
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {programs.map((program) => (
          <Card key={program.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group active:scale-[0.99]">
            <CardHeader className={cn("pb-4", program.color)}>
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-none font-bold uppercase tracking-widest text-[10px]">
                  {program.level}
                </Badge>
                <div className="p-2 bg-background/50 rounded-lg backdrop-blur-sm">
                  <Dumbbell className="w-5 h-5" />
                </div>
              </div>
              <CardTitle className="mt-4 group-hover:text-primary transition-colors">{program.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Target className="w-3 h-3" /> {program.goal}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Duration</p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Calendar className="w-4 h-4 text-primary" /> {program.duration}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Sessions</p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Clock className="w-4 h-4 text-primary" /> {program.sessions}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{program.activeClients} Active Clients</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 p-2">
              <Button variant="ghost" className="w-full justify-between hover:bg-primary hover:text-primary-foreground group-hover:translate-x-1 transition-all">
                View Details
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-primary fill-primary" />
              Recent Session Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border bg-card/50 hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                      W{i}
                    </div>
                    <div>
                      <h4 className="font-bold">Lower Body Power</h4>
                      <p className="text-xs text-muted-foreground">Strength Foundation • John Doe</p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold">Completed</p>
                    <p className="text-xs text-muted-foreground">Today, 10:30 AM</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary text-primary-foreground overflow-hidden relative">
          <CardHeader className="relative z-10">
            <CardTitle>Program Templates</CardTitle>
            <CardDescription className="text-primary-foreground/70">Quickly assign pre-built programs to new members.</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">
            <p className="text-sm leading-relaxed">
              Use our verified program templates designed by FAT GYM Head Coaches to ensure consistent results across all clients.
            </p>
            <Button variant="secondary" className="w-full">Browse Templates</Button>
          </CardContent>
          <Dumbbell className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12" />
        </Card>
      </div>
    </div>
  );
}
