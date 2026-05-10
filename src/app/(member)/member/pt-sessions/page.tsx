import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  Dumbbell, 
  History,
  MoreVertical,
  Star,
  Plus
} from "lucide-react";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function MemberPTSessionsPage() {
  const session = await getSession();
  if (!session) return notFound();

  const member = await db.member.findUnique({
    where: { userId: session.user.id },
    include: {
      ptSessions: {
        include: { trainer: { include: { user: true } } },
        orderBy: { date: "desc" }
      }
    }
  });

  if (!member) return notFound();

  const upcoming = member.ptSessions.filter(s => s.date >= new Date());
  const past = member.ptSessions.filter(s => s.date < new Date());

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">PT Sessions</h2>
          <p className="text-muted-foreground text-sm">Your personal training schedule and history.</p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 px-6 rounded-xl shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" /> Book New Session
        </Button>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" /> Upcoming Sessions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcoming.length > 0 ? upcoming.map((s) => (
            <Card key={s.id} className="border-none shadow-sm hover:shadow-md transition-shadow group">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-24 bg-primary/5 flex flex-col items-center justify-center border-r border-dashed group-hover:bg-primary/10 transition-colors">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">{s.date.toLocaleString('en-US', { month: 'short' })}</span>
                    <span className="text-2xl font-black">{s.date.getDate()}</span>
                  </div>
                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-bold text-lg">Session with {s.trainer.user.name || "Trainer"}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4" /> {s.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-none">{s.status}</Badge>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={s.trainer.user.image || ""} />
                        <AvatarFallback>{s.trainer.user.name?.[0] || "T"}</AvatarFallback>
                      </Avatar>
                      <Button variant="ghost" size="sm" className="text-primary font-bold">Reschedule</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <p className="text-muted-foreground text-sm py-4 italic">No upcoming sessions.</p>
          )}
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <History className="w-5 h-5 text-muted-foreground" /> Session History
        </h3>
        <div className="space-y-3">
          {past.map((s) => (
            <div key={s.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-card rounded-2xl border shadow-sm hover:bg-muted/30 transition-colors gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Session with {s.trainer.user.name || "Trainer"}</h4>
                  <p className="text-[10px] text-muted-foreground">{s.date.toLocaleDateString()} • {s.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
