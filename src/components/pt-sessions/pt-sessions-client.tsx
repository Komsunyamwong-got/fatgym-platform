"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { PTSessionForm } from "@/components/pt-sessions/pt-session-form";
import { PTSessionsTable } from "@/components/pt-sessions/pt-sessions-table";
import { 
  Plus, 
  Search, 
  Filter,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  List,
  Info,
  CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PTSessionsClientProps {
  initialSessions: any[];
}

export function PTSessionsClient({ initialSessions }: PTSessionsClientProps) {
  const [sessions, setSessions] = useState<any[]>(initialSessions);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showHistoryOnly, setShowHistoryOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  
  // Date state for Monthly Calendar (system date May 22, 2026)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 22));

  // Today in mock state is May 22, 2026
  const todayDate = new Date(2026, 4, 22);

  // 1. Stats Calculation based on current state
  const todayCount = sessions.filter(s => {
    const sDate = new Date(s.date);
    return (
      sDate.getDate() === todayDate.getDate() &&
      sDate.getMonth() === todayDate.getMonth() &&
      sDate.getFullYear() === todayDate.getFullYear()
    );
  }).length;
  
  const pendingCount = sessions.filter(s => s.status === "PENDING_CONFIRMATION").length;
  const completedCount = sessions.filter(s => s.status === "CONFIRMED").length;

  // 2. Search, Status Filter, and History Logic
  const filteredSessions = sessions.filter(s => {
    // Search query check (member name, trainer name, member ID)
    const matchesSearch = 
      s.member.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.member.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.trainer.user.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Status filter check
    if (statusFilter !== "ALL" && s.status !== statusFilter) return false;

    // History check
    const sDate = new Date(s.date);
    sDate.setHours(0, 0, 0, 0);
    const mockToday = new Date(2026, 4, 22);
    mockToday.setHours(0, 0, 0, 0);

    if (showHistoryOnly) {
      // Past sessions
      return sDate.getTime() < mockToday.getTime();
    } else {
      // Current or upcoming sessions
      return sDate.getTime() >= mockToday.getTime();
    }
  });

  // 3. Monthly Calendar Grid Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7; // Mon = 0, Sun = 6
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  
  const calendarCells = [];
  
  // Padding cells from previous month
  for (let i = startDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDays - i)
    });
  }
  
  // Days of current month
  for (let i = 1; i <= totalDaysInMonth; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i)
    });
  }
  
  // Padding cells from next month
  const totalCellsSoFar = calendarCells.length;
  const remainingPadding = totalCellsSoFar % 7 === 0 ? 0 : 7 - (totalCellsSoFar % 7);
  for (let i = 1; i <= remainingPadding; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i)
    });
  }

  const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  // Helper to fetch PT sessions on a specific date
  const getSessionsForDate = (date: Date) => {
    return sessions.filter(s => {
      const sDate = new Date(s.date);
      return (
        sDate.getDate() === date.getDate() &&
        sDate.getMonth() === date.getMonth() &&
        sDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Title & Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">PT Sessions</h2>
          <p className="text-muted-foreground text-sm">Schedule and track private training sessions.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className={cn(
              "gap-2 font-semibold hover:scale-105 active:scale-95 transition-all duration-200",
              viewMode === "calendar" && "bg-zinc-900 text-white hover:bg-zinc-800"
            )}
            onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
          >
            {viewMode === "list" ? (
              <>
                <CalendarIcon className="w-4 h-4" /> Calendar View
              </>
            ) : (
              <>
                <List className="w-4 h-4" /> List Table
              </>
            )}
          </Button>
          <Dialog>
            <DialogTrigger
              render={
                <Button className="gap-2 font-semibold hover:scale-105 active:scale-95 transition-all shadow-sm">
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

      {/* Cards Stat Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Today's Sessions</p>
              <p className="text-2xl font-black text-zinc-900">{todayCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-black text-zinc-900">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completed (Mo)</p>
              <p className="text-2xl font-black text-zinc-900">{completedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Action filter panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl shadow-sm border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10 bg-muted/50 border-none focus-visible:ring-primary/20" 
            placeholder="Search by member or trainer..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {/* Status filters */}
          <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-lg border flex-grow md:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1 text-xs font-bold bg-transparent focus:outline-none cursor-pointer border-none text-zinc-800"
            >
              <option value="ALL">All Status</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING_CONFIRMATION">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          
          <Button 
            variant={showHistoryOnly ? "default" : "outline"} 
            className={cn(
              "flex-1 md:flex-none font-semibold transition-all duration-200",
              showHistoryOnly && "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            onClick={() => setShowHistoryOnly(!showHistoryOnly)}
          >
            History
          </Button>
        </div>
      </div>

      {/* Primary Display Layout */}
      {viewMode === "list" ? (
        <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
          {filteredSessions.length === 0 ? (
            <div className="py-20 text-center bg-muted/20">
              <p className="text-muted-foreground font-semibold">No PT sessions found matching current filters.</p>
            </div>
          ) : (
            <PTSessionsTable sessions={filteredSessions} />
          )}
        </div>
      ) : (
        /* Monthly PT Calendar View */
        <div className="bg-card rounded-2xl border shadow-sm p-6 space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <div className="flex items-center gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="font-bold text-xs" 
                onClick={() => setCurrentDate(new Date(2026, 4, 22))}
              >
                Today
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weekdays.map(day => (
              <div key={day} className="text-center text-xs font-bold text-muted-foreground py-2 tracking-wider">
                {day}
              </div>
            ))}

            {calendarCells.map((cell, idx) => {
              const daySessions = getSessionsForDate(cell.date);
              const isToday = 
                cell.date.getDate() === 22 && 
                cell.date.getMonth() === 4 && 
                cell.date.getFullYear() === 2026;

              return (
                <div 
                  key={idx} 
                  className={cn(
                    "min-h-24 p-2 rounded-xl border transition-all duration-200 bg-background flex flex-col justify-between",
                    !cell.isCurrentMonth && "opacity-40 bg-muted/10 border-dashed",
                    isToday && "ring-2 ring-primary border-primary bg-primary/5",
                    "hover:border-primary/50 hover:shadow-sm"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className={cn(
                      "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                      isToday ? "bg-primary text-primary-foreground font-extrabold" : "text-muted-foreground"
                    )}>
                      {cell.day}
                    </span>
                    {daySessions.length > 0 && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {daySessions.length} {daySessions.length === 1 ? "Session" : "Sessions"}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 mt-2 flex-grow overflow-y-auto max-h-16 scrollbar-none">
                    {daySessions.slice(0, 2).map(s => (
                      <div 
                        key={s.id} 
                        className={cn(
                          "flex flex-col text-[9px] font-bold p-1 rounded-md border cursor-pointer transition-all truncate",
                          s.status === "CONFIRMED" ? "bg-blue-500/10 border-blue-500/20 text-blue-800" :
                          "bg-orange-500/10 border-orange-500/20 text-orange-800"
                        )}
                        title={`${s.member.user.name} with ${s.trainer.user.name} at ${new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      >
                        <span className="truncate">{s.member.user.name.split(" ")[0]} ({s.trainer.user.name.split(" ")[1]})</span>
                        <span className="text-[8px] opacity-75 font-semibold shrink-0">
                          {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                      </div>
                    ))}
                    {daySessions.length > 2 && (
                      <div className="text-[8px] font-bold text-center text-muted-foreground bg-muted/50 p-0.5 rounded border">
                        + {daySessions.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-xl border text-xs text-muted-foreground">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <span>Blue cells represent Confirmed PT sessions, and orange cells represent Pending trainer confirmation sessions.</span>
          </div>
        </div>
      )}
    </div>
  );
}
