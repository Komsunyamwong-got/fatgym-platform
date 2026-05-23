"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  User,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { PTSessionForm } from "@/components/pt-sessions/pt-session-form";

const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM

export function ScheduleView({ sessions, trainers }: { sessions: any[], trainers: any[] }) {
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("trainerId");
    }
    return null;
  });
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Helper to get all 7 dates of the selected week (Mon - Sun)
  const getWeekDates = (date: Date) => {
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(current.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };

  const filteredSessions = sessions.filter(s => {
    const isSameTrainer = selectedTrainer ? s.trainerId === selectedTrainer : true;
    if (viewMode === "daily") {
      const isSameDay = new Date(s.date).toDateString() === selectedDate.toDateString();
      return isSameDay && isSameTrainer;
    } else {
      const weekDates = getWeekDates(selectedDate);
      const isWithinWeek = weekDates.some(d => new Date(s.date).toDateString() === d.toDateString());
      return isWithinWeek && isSameTrainer;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Schedule</h2>
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => {
                const days = viewMode === "daily" ? 1 : 7;
                setSelectedDate(new Date(selectedDate.getTime() - days * 24 * 60 * 60 * 1000));
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-bold px-2">
              {viewMode === "daily" ? (
                selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              ) : (
                (() => {
                  const weekDates = getWeekDates(selectedDate);
                  const start = weekDates[0];
                  const end = weekDates[6];
                  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                })()
              )}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => {
                const days = viewMode === "daily" ? 1 : 7;
                setSelectedDate(new Date(selectedDate.getTime() + days * 24 * 60 * 60 * 1000));
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === "weekly" ? "default" : "outline"} 
            className="gap-2 shadow-sm transition-all"
            onClick={() => setViewMode(viewMode === "daily" ? "weekly" : "daily")}
          >
            <CalendarIcon className="w-4 h-4" /> {viewMode === "weekly" ? "Daily View" : "Weekly View"}
          </Button>
          <Dialog>
            <DialogTrigger
              render={
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> Book Session
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book PT Session</DialogTitle>
              </DialogHeader>
              <PTSessionForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 border-none shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {viewMode === "weekly" && (
                <div className="flex border-b border-muted/30 bg-muted/10">
                  <div className="w-20 p-4 border-r border-muted/30 flex items-center justify-center font-bold text-xs text-muted-foreground">
                    Time
                  </div>
                  {getWeekDates(selectedDate).map((d, i) => {
                    const isToday = new Date().toDateString() === d.toDateString();
                    return (
                      <div key={i} className="flex-1 text-center py-3 border-r border-muted/30 last:border-0">
                        <p className="text-xs font-bold text-muted-foreground uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                        <p className={cn(
                          "text-base font-extrabold mt-0.5 w-7 h-7 flex items-center justify-center mx-auto rounded-full", 
                          isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                        )}>
                          {d.getDate()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {hours.map((hour) => {
                if (viewMode === "daily") {
                  const hourSessions = filteredSessions.filter(s => new Date(s.startTime).getHours() === hour);
                  
                  return (
                    <div key={hour} className="flex border-b last:border-0 min-h-[80px] group">
                      <div className="w-20 p-4 border-r bg-muted/20 text-xs font-bold text-muted-foreground flex flex-col justify-between">
                        <span>{hour}:00</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                          {hour}:30
                        </span>
                      </div>
                      <div className="flex-1 p-2 relative flex gap-2">
                        {hourSessions.map((session) => (
                          <div 
                            key={session.id} 
                            className={cn(
                              "flex-1 p-3 rounded-lg border-l-4 shadow-sm flex flex-col justify-between transition-all hover:scale-[1.01] cursor-pointer bg-green-100 border-green-200 text-green-700"
                            )}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70">PT Session</p>
                                <p className="font-bold text-sm mt-0.5">{session.member.user.name}</p>
                              </div>
                              <Badge variant="outline" className="bg-white/50 border-none text-[10px] font-bold">
                                {session.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-[11px] font-medium">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> 
                                {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" /> 
                                {session.trainer.user.name}
                              </span>
                            </div>
                          </div>
                        ))}
                        {hourSessions.length === 0 && (
                          <div className="flex-1 rounded-lg border-2 border-dashed border-muted/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Dialog>
                              <DialogTrigger
                                render={
                                  <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
                                    <Plus className="w-3 h-3" /> Quick Book
                                  </Button>
                                }
                              />
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Book PT Session</DialogTitle>
                                </DialogHeader>
                                <PTSessionForm />
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  // Weekly mode
                  const weekDates = getWeekDates(selectedDate);
                  return (
                    <div key={hour} className="flex border-b last:border-0 min-h-[90px]">
                      <div className="w-20 p-3 border-r bg-muted/20 text-xs font-bold text-muted-foreground flex items-center justify-center">
                        {hour}:00
                      </div>
                      {weekDates.map((dayDate, dayIdx) => {
                        const daySessions = filteredSessions.filter(s => 
                          new Date(s.date).toDateString() === dayDate.toDateString() &&
                          new Date(s.startTime).getHours() === hour
                        );

                        return (
                          <div key={dayIdx} className="flex-1 p-1 border-r last:border-r-0 min-w-[90px] relative flex flex-col gap-1 bg-muted/5 group/cell">
                            {daySessions.map((session) => (
                              <div 
                                key={session.id} 
                                className="p-1.5 rounded-md border-l-2 shadow-xs flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer bg-green-50 border-green-200 text-green-700 h-full min-h-[60px]"
                              >
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-bold text-[10px] truncate leading-tight">{session.member.user.name}</span>
                                  <span className="text-[9px] text-green-600 truncate">{session.trainer.user.name}</span>
                                </div>
                                <div className="flex items-center justify-between text-[8px] font-medium mt-1">
                                  <span className="flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5" /> 
                                    {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            ))}
                            {daySessions.length === 0 && (
                              <Dialog>
                                <DialogTrigger
                                  render={
                                    <button className="w-full h-full rounded-md border border-dashed border-muted/10 hover:border-primary/20 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity cursor-pointer p-1">
                                      <Plus className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-primary" />
                                    </button>
                                  }
                                />
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Book PT Session</DialogTitle>
                                  </DialogHeader>
                                  <PTSessionForm />
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Filter by Trainer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div 
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg cursor-pointer group",
                  selectedTrainer === null ? "bg-primary/10" : "hover:bg-muted/50"
                )}
                onClick={() => setSelectedTrainer(null)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", selectedTrainer === null ? "bg-primary" : "bg-muted")} />
                  <span className="text-sm font-medium">All Trainers</span>
                </div>
              </div>
              {trainers.map((trainer) => (
                <div 
                  key={trainer.id} 
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg cursor-pointer group",
                    selectedTrainer === trainer.id ? "bg-primary/10" : "hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedTrainer(trainer.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", selectedTrainer === trainer.id ? "bg-primary" : "bg-muted")} />
                    <span className="text-sm font-medium">{trainer.user.name}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
