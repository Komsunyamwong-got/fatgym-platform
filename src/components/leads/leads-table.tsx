"use client";

import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Phone, Mail, MessageSquare, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const statusStyles = {
  NEW_LEAD: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-purple-100 text-purple-700",
  INTERESTED: "bg-orange-100 text-orange-700",
  WON: "bg-green-100 text-green-700",
  LOST: "bg-red-100 text-red-700",
};

export function LeadsTable({ leads }: { leads: any[] }) {
  return (
    <ResponsiveDataTable
      data={leads}
      columns={[
        {
          header: "Lead",
          accessorKey: "name",
          cell: (lead: any) => (
            <div className="flex flex-col">
              <span className="font-bold">{lead.name}</span>
              <span className="text-xs text-muted-foreground text-[10px]">{lead.id}</span>
            </div>
          ),
        },
        {
          header: "Contact",
          accessorKey: "phone",
          cell: (lead: any) => (
            <div className="flex flex-col gap-1">
              <span className="text-xs flex items-center gap-1"><Phone className="w-3 h-3 text-muted-foreground" /> {lead.phone || "-"}</span>
              <span className="text-xs flex items-center gap-1"><Mail className="w-3 h-3 text-muted-foreground" /> {lead.email || "-"}</span>
            </div>
          ),
        },
        {
          header: "Status",
          accessorKey: "status",
          cell: (lead: any) => (
            <Badge 
              variant="outline"
              className={cn(
                "border-none font-bold text-[10px] uppercase tracking-wider",
                statusStyles[lead.status as keyof typeof statusStyles]
              )}
            >
              {lead.status.replace("_", " ")}
            </Badge>
          ),
        },
        {
          header: "Interest",
          accessorKey: "interest",
        },
        {
          header: "Source",
          accessorKey: "source",
        },
        {
          header: "Created At",
          accessorKey: "createdAt",
          cell: (lead: any) => new Date(lead.createdAt).toLocaleDateString(),
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
      mobileRender={(lead: any) => (
        <div className="p-4 space-y-4 border-b last:border-0">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold">{lead.name}</h4>
              <p className="text-xs text-muted-foreground">{lead.interest} • {lead.source}</p>
            </div>
            <Badge 
              className={cn(
                "border-none font-bold text-[10px]",
                statusStyles[lead.status as keyof typeof statusStyles]
              )}
            >
              {lead.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Contact</span>
              <span className="text-xs mt-1">{lead.phone || "-"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Created</span>
              <span className="text-xs mt-1">{new Date(lead.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 h-9 gap-2" variant="outline">
              <MessageSquare className="w-4 h-4" /> Note
            </Button>
            <Button className="flex-1 h-9 gap-2">
              <Plus className="w-4 h-4" /> Follow up
            </Button>
          </div>
        </div>
      )}
    />
  );
}
