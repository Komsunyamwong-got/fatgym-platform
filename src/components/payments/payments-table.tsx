"use client";

import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

export function PaymentsTable({ payments }: { payments: any[] }) {
  return (
    <ResponsiveDataTable
      data={payments}
      columns={[
        {
          header: "Member",
          accessorKey: "id",
          cell: (p: any) => (
            <div className="flex flex-col">
              <span className="font-bold">{p.purchase.member.user.name}</span>
              <span className="text-xs text-muted-foreground text-[10px]">{p.purchase.member.memberId}</span>
            </div>
          ),
        },
        {
          header: "Receipt #",
          accessorKey: "receiptNumber",
          cell: (p: any) => <code className="text-[10px] bg-muted px-1 rounded">{p.receiptNumber || "N/A"}</code>,
        },
        {
          header: "Item",
          accessorKey: "id",
          cell: (p: any) => (
            <Badge variant="secondary" className="text-[10px]">
              {p.purchase.membershipPackage?.name || p.purchase.ptPackage?.name || "Purchase"}
            </Badge>
          ),
        },
        {
          header: "Method",
          accessorKey: "method",
          cell: (p: any) => (
            <div className="flex items-center gap-2 text-xs">
              <CreditCard className="w-3 h-3 text-muted-foreground" />
              {p.method}
            </div>
          ),
        },
        {
          header: "Amount",
          accessorKey: "amount",
          cell: (p: any) => <span className="font-bold">฿{Number(p.amount).toLocaleString()}</span>,
        },
        {
          header: "Date",
          accessorKey: "createdAt",
          cell: (p: any) => new Date(p.createdAt).toLocaleDateString(),
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
      mobileRender={(p: any) => (
        <div className="p-4 space-y-4 border-b last:border-0">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold">{p.purchase.member.user.name}</h4>
              <p className="text-xs text-muted-foreground">
                {p.purchase.membershipPackage?.name || p.purchase.ptPackage?.name || "Purchase"} • {p.method}
              </p>
            </div>
            <span className="text-sm font-bold">฿{Number(p.amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-2 border-t">
            <span>{new Date(p.createdAt).toLocaleString()}</span>
            <span>Ref: {p.receiptNumber || "N/A"}</span>
          </div>
        </div>
      )}
    />
  );
}
