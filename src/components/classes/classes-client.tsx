"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { ClassForm } from "@/components/classes/class-form";
import { 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Dumbbell, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassesClientProps {
  initialClasses: any[];
}

export function ClassesClient({ initialClasses }: ClassesClientProps) {
  const [classes, setClasses] = useState<any[]>(initialClasses);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  
  // Date state for Monthly Calendar
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 22)); // Match system date (May 22, 2026)

  // 1. Search & Filter Logic
  const filteredClasses = classes.filter(cls => {
    // Search query check
    const matchesSearch = 
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      cls.trainer.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.description && cls.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Today check
    if (!matchesSearch) return false;
    if (showTodayOnly) {
      const classDate = new Date(cls.startTime);
      // Today in mock state is May 22, 2026
      const today = new Date(2026, 4, 22);
      return (
        classDate.getDate() === today.getDate() &&
        classDate.getMonth() === today.getMonth() &&
        classDate.getFullYear() === today.getFullYear()
      );
    }
    return true;
  });

  // 2. Monthly Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get the start of the month
  const firstDayOfMonth = new Date(year, month, 1);
  // Get index (0 = Sun, 1 = Mon... 6 = Sat)
  // We want 0 = Mon, 6 = Sun
  const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7; 
  
  // Get total days in current month
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Get total days in previous month for padding
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

  // Helper to check if a class falls on a specific calendar cell
  const getClassesForDate = (date: Date) => {
    return classes.filter(cls => {
      const clsDate = new Date(cls.startTime);
      return (
        clsDate.getDate() === date.getDate() &&
        clsDate.getMonth() === date.getMonth() &&
        clsDate.getFullYear() === date.getFullYear()
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
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Group Classes</h2>
          <p className="text-muted-foreground text-sm">Schedule and manage gym group sessions.</p>
        </div>
        <Dialog>
          <DialogTrigger
            render={
              <Button className="gap-2 shadow-sm font-semibold hover:scale-105 active:scale-95 transition-all">
                <Plus className="w-4 h-4" /> Create Class
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
            </DialogHeader>
            <ClassForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl shadow-sm border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10 bg-muted/50 border-none focus-visible:ring-primary/20" 
            placeholder="Search classes or coaches..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant={showTodayOnly ? "default" : "outline"} 
            className={cn(
              "flex-1 md:flex-none font-semibold transition-all duration-200",
              showTodayOnly && "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            onClick={() => setShowTodayOnly(!showTodayOnly)}
          >
            Today
          </Button>
          <Button 
            variant="outline" 
            className={cn(
              "flex-1 md:flex-none font-semibold gap-2 transition-all duration-200",
              viewMode === "calendar" && "bg-zinc-900 text-white hover:bg-zinc-800"
            )}
            onClick={() => setViewMode(viewMode === "grid" ? "calendar" : "grid")}
          >
            {viewMode === "grid" ? (
              <>
                <CalendarIcon className="w-4 h-4" /> Calendar View
              </>
            ) : (
              <>
                <LayoutGrid className="w-4 h-4" /> Card Grid
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Primary Display Mode */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.length === 0 && (
            <div className="col-span-full py-20 text-center bg-muted/20 rounded-2xl border-2 border-dashed">
              <p className="text-muted-foreground font-medium">No classes found. Try searching something else or create a class!</p>
            </div>
          )}
          {filteredClasses.map((cls) => (
            <Card key={cls.id} className="border-none shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden bg-card hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-2.5 py-0.5 font-semibold text-xs rounded-full">
                    {cls.category || "Fitness"}
                  </Badge>
                </div>
                <div className="pt-4">
                  <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors duration-200">{cls.name}</CardTitle>
                  <CardDescription className="line-clamp-1 mt-1">{cls.description || "No description provided."}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    {new Date(cls.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    {new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground col-span-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-bold text-zinc-900">{cls._count?.bookings || 0} / {cls.capacity}</span> Booked
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-muted/70">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="w-7 h-7 border border-primary/10 shadow-sm">
                      <AvatarImage src={cls.trainer?.user?.image || ""} />
                      <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
                        {cls.trainer?.user?.name ? cls.trainer.user.name.split(" ").map((n: string) => n[0]).join("") : "CO"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-bold text-zinc-800">
                      {cls.trainer?.user?.name ? `Coach ${cls.trainer.user.name.split(" ")[1] || cls.trainer.user.name}` : "Coach"}
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted font-bold text-[10px] rounded-md px-2 py-0.5">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Monthly Calendar View */
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
              const dayClasses = getClassesForDate(cell.date);
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
                    {dayClasses.length > 0 && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        {dayClasses.length} {dayClasses.length === 1 ? "Class" : "Classes"}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 mt-2 flex-grow overflow-y-auto max-h-16 scrollbar-none">
                    {dayClasses.slice(0, 2).map(cls => (
                      <div 
                        key={cls.id} 
                        className="group/pill flex items-center justify-between text-[10px] font-bold p-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-500/10 cursor-pointer transition-all truncate"
                        title={`${cls.name} at ${new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      >
                        <span className="truncate">{cls.name}</span>
                        <span className="text-[8px] opacity-75 font-semibold shrink-0 ml-1">
                          {new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                      </div>
                    ))}
                    {dayClasses.length > 2 && (
                      <div className="text-[9px] font-bold text-center text-muted-foreground bg-muted/50 p-0.5 rounded border">
                        + {dayClasses.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-xl border text-xs text-muted-foreground">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <span>Hover over calendar items to view class details. Dates highlight the selected time schedule range in real-time.</span>
          </div>
        </div>
      )}
    </div>
  );
}
