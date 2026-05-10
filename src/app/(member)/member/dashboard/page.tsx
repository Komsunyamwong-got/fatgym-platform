import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Dumbbell, 
  TrendingUp, 
  Activity,
  ChevronRight,
  Clock,
  Star
} from "lucide-react";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function MemberDashboardPage() {
  const session = await getSession();
  if (!session) return notFound();

  const member = await db.member.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      ptSessions: {
        where: { status: "CONFIRMED", date: { gte: new Date() } },
        include: { trainer: { include: { user: true } } },
        orderBy: { date: "asc" },
        take: 1
      },
      goals: true
    }
  });

  if (!member) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <h2 className="text-xl font-bold">Welcome, {session.user.name}!</h2>
      <p className="text-muted-foreground">Your member profile is being set up.</p>
    </div>
  );

  const nextSession = member.ptSessions[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-primary text-primary-foreground p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <Badge className="bg-white/20 text-white border-none backdrop-blur-md">Active Member</Badge>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {member.user.name}!</h1>
            <p className="text-primary-foreground/80 mt-1">You have crushed 12 sessions this month. Keep it up!</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="font-bold">Book PT Session</Button>
            <Button variant="ghost" className="text-white hover:bg-white/10 border border-white/20">View Schedule</Button>
          </div>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
          <Dumbbell className="w-64 h-64 rotate-12" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Session</CardTitle>
              <CardDescription>Your next personal training appointment.</CardDescription>
            </div>
            <div className="p-2 bg-primary/10 text-primary rounded-full">
              <Calendar className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {nextSession ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-muted/30 border border-dashed border-primary/20">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex flex-col items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                    <span className="text-[10px] uppercase font-bold opacity-80">{nextSession.date.toLocaleString('en-US', { month: 'short' })}</span>
                    <span className="text-2xl font-black leading-none">{nextSession.date.getDate()}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Session with Coach {nextSession.trainer.user.name?.split(" ")[1] || "Trainer"}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4" /> {nextSession.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {nextSession.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="gap-2 group">
                  Details <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            ) : (
              <div className="text-center p-12 bg-muted/20 rounded-2xl border border-dashed">
                <p className="text-muted-foreground">No sessions booked yet.</p>
                <Button variant="link" className="text-primary mt-2">Book your first session</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Member Progress</CardTitle>
            <CardDescription>Goal: {member.goals[0]?.mainGoal || "Fitness"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Attendance</span>
                <span className="font-bold text-primary">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                <TrendingUp className="w-4 h-4" /> Stats
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-xl text-center">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Weight</p>
                  <p className="text-xl font-bold mt-1">72.4 <span className="text-xs font-normal">kg</span></p>
                </div>
                <div className="bg-muted/50 p-4 rounded-xl text-center">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Body Fat</p>
                  <p className="text-xl font-bold mt-1">18.2 <span className="text-xs font-normal">%</span></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
