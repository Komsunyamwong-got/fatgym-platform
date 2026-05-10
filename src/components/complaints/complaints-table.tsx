"use client";

import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function ComplaintsTable({ complaints }: { complaints: any[] }) {
  return (
    <ResponsiveDataTable
      data={complaints}
      columns={[
        {
          header: "Member",
          accessorKey: "memberId",
          cell: (c: any) => (
            <div className="flex flex-col">
              <span className="font-bold">{c.member.user.name}</span>
              <span className="text-xs text-muted-foreground text-[10px]">{c.member.memberId}</span>
            </div>
          ),
        },
        {
          header: "Type",
          accessorKey: "type",
          cell: (c: any) => <span className="font-medium">{c.type}</span>,
        },
        {
          header: "Status",
          accessorKey: "status",
          cell: (c: any) => (
            <Badge 
              className={cn(
                "border-none font-bold text-[10px]",
                c.status === "RESOLVED" ? "bg-green-100 text-green-700" : 
                c.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                "bg-orange-100 text-orange-700"
              )}
            >
              {c.status.replace(/_/g, " ")}
            </Badge>
          ),
        },
        {
          header: "Created",
          accessorKey: "createdAt",
          cell: (c: any) => new Date(c.createdAt).toLocaleDateString(),
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
      mobileRender={(c: any) => (
        <div className="p-4 space-y-4 border-b last:border-0">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold">{c.member.user.name}</h4>
              <p className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</p>
            </div>
            <Badge 
              className={cn(
                "border-none font-bold text-[10px]",
                c.status === "RESOLVED" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
              )}
            >
              {c.status}
            </Badge>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg">
            <h5 className="font-bold text-xs">{c.type}</h5>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 h-9" variant="outline">View Details</Button>
            <Button className="flex-1 h-9">Resolve</Button>
          </div>
        </div>
      )}
    />
  );
}
