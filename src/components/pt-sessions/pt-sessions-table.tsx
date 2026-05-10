"use client";

import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Clock, Calendar as CalendarIcon, User, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

export function PTSessionsTable({ sessions }: { sessions: any[] }) {
  return (
    <ResponsiveDataTable
      data={sessions}
      columns={[
        {
          header: "Date",
          accessorKey: "date",
          cell: (s: any) => (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/5 flex flex-col items-center justify-center border border-primary/10">
                <span className="text-[10px] font-bold text-primary uppercase">{new Date(s.date).toLocaleString('en-US', { month: 'short' })}</span>
                <span className="text-sm font-black leading-none">{new Date(s.date).getDate()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(s.date).getFullYear()}</span>
              </div>
            </div>
          ),
        },
        {
          header: "Member",
          accessorKey: "memberId",
          cell: (s: any) => (
            <div className="flex flex-col">
              <span className="font-bold">{s.member.user.name}</span>
              <span className="text-xs text-muted-foreground text-[10px]">{s.member.memberId}</span>
            </div>
          ),
        },
        {
          header: "Trainer",
          accessorKey: "trainerId",
          cell: (s: any) => (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                {s.trainer.user.name?.[0]}
              </div>
              <span className="text-sm">{s.trainer.user.name}</span>
            </div>
          ),
        },
        {
          header: "Status",
          accessorKey: "status",
          cell: (s: any) => (
            <Badge 
              className={cn(
                "border-none font-bold text-[10px]",
                s.status === "COMPLETED" ? "bg-green-100 text-green-700" : 
                s.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                s.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                "bg-orange-100 text-orange-700"
              )}
            >
              {s.status.replace(/_/g, " ")}
            </Badge>
          ),
        },
        {
          header: "",
          accessorKey: "id",
          cell: () => (
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          ),
        },
      ]}
      mobileRender={(s: any) => (
        <div className="p-4 space-y-4 border-b last:border-0">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex flex-col items-center justify-center border border-primary/10">
                <span className="text-[10px] font-bold text-primary uppercase">{new Date(s.date).toLocaleString('en-US', { month: 'short' })}</span>
                <span className="text-lg font-black leading-none">{new Date(s.date).getDate()}</span>
              </div>
              <div>
                <h4 className="font-bold">{s.member.user.name}</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} with {s.trainer.user.name}
                </p>
              </div>
            </div>
            <Badge 
              className={cn(
                "border-none font-bold text-[10px]",
                s.status === "COMPLETED" ? "bg-green-100 text-green-700" : 
                s.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                "bg-orange-100 text-orange-700"
              )}
            >
              {s.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 h-9" variant="outline">Check-in</Button>
            <Button className="flex-1 h-9">Reschedule</Button>
          </div>
        </div>
      )}
    />
  );
}
