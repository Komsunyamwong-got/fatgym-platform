import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Phone, 
  Mail, 
  Calendar, 
  Dumbbell, 
  TrendingUp, 
  History,
  Activity,
  MoreVertical,
  Plus,
  Scale,
  Ruler,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import db from "@/lib/db";
import { notFound } from "next/navigation";

export default async function MemberDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const member = await db.member.findUnique({
    where: { id },
    include: {
      user: true,
      ptSessions: {
        include: { trainer: { include: { user: true } } },
        orderBy: { date: "desc" },
        take: 5
      },
      measurements: {
        orderBy: { date: "desc" },
        take: 10
      },
      goals: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!member) return notFound();

  // Transform measurement data for charts
  const weightData = member.measurements.map(m => ({
    date: m.date.toLocaleDateString('en-US', { month: 'short' }),
    weight: m.weight
  })).reverse();

  const latestStats = member.measurements[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Profile Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-6">
          <Avatar className="w-24 h-24 border-4 border-primary/10">
            <AvatarImage src={member.user.image || ""} />
            <AvatarFallback className="bg-primary/5 text-primary text-3xl font-bold">
              {member.user.name?.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{member.user.name}</h1>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">{member.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {member.phone}</span>
              <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {member.user.email}</span>
              <span className="flex items-center gap-1 font-bold text-foreground">ID: {member.memberId}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon"><MoreVertical className="w-4 h-4" /></Button>
          <Button className="gap-2"><Plus className="w-4 h-4" /> Log Session</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Membership Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Expiry Date</span>
                <span className="font-bold">{member.expiryDate?.toLocaleDateString() || "N/A"}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">PT Sessions Balance</span>
                  <span className="text-sm font-bold">12 / 24</span>
                </div>
                <Progress value={50} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Target className="w-4 h-4" /> Fitness Goals</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {member.goals.length > 0 ? member.goals.map((goal, i) => (
                <div key={i} className="p-3 bg-muted/30 rounded-lg">
                  <p className="font-bold text-sm">{goal.mainGoal}</p>
                  <p className="text-xs text-muted-foreground mt-1">Target: {goal.targetValue || "N/A"}</p>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No goals set yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="progress" className="space-y-6">
            <TabsList className="bg-card border w-full justify-start h-12 p-1 gap-2">
              <TabsTrigger value="progress" className="gap-2 px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Activity className="w-4 h-4" /> Progress & Stats
              </TabsTrigger>
              <TabsTrigger value="sessions" className="gap-2 px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <History className="w-4 h-4" /> PT History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="progress" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-none shadow-sm bg-blue-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-blue-600 uppercase font-bold">Latest Weight</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <p className="text-3xl font-black">{latestStats?.weight || "--"} <span className="text-sm font-normal">kg</span></p>
                      <Scale className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-purple-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-purple-600 uppercase font-bold">Body Fat %</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <p className="text-3xl font-black">{latestStats?.bodyFat || "--"} <span className="text-sm font-normal">%</span></p>
                      <TrendingUp className="w-8 h-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-base">Weight Progress Over Time</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                  {weightData.length > 0 ? (
                    <DashboardCharts salesData={weightData} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground italic">No measurement history found. Use the onboarding wizard to add data.</div>
                  )}
                </CardContent>
              </Card>

              {latestStats && (
                <Card className="border-none shadow-sm">
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><Ruler className="w-5 h-5" /> Circumference History</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: "Chest", val: latestStats.chest },
                        { label: "Waist", val: latestStats.waist },
                        { label: "Hips", val: latestStats.hips },
                        { label: "Arms", val: latestStats.arms },
                      ].map((item, i) => (
                        <div key={i} className="p-3 bg-muted/20 rounded-xl text-center">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">{item.label}</p>
                          <p className="text-lg font-bold mt-1">{item.val || "--"} <span className="text-xs font-normal">cm</span></p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              {member.ptSessions.length > 0 ? member.ptSessions.map((session, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 cursor-pointer transition-colors group shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold group-hover:text-primary transition-colors">Session with Coach {session.trainer.user.name?.split(" ")[1] || "Trainer"}</h4>
                      <p className="text-xs text-muted-foreground">{session.date.toLocaleString()}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn(
                    "border-none font-bold text-[10px]",
                    session.status === "CONFIRMED" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  )}>
                    {session.status}
                  </Badge>
                </div>
              )) : (
                <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed text-muted-foreground">No session history recorded.</div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
