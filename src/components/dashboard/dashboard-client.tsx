"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Star, 
  Calendar, 
  TrendingUp,
  MoreVertical,
  Users,
  CreditCard,
  Package,
  MessageSquare,
  AlertCircle,
  Eye,
  CheckCircle,
  Trash
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MemberForm } from "@/components/members/member-form";
import Link from "next/link";
import { toast } from "sonner";

interface DashboardClientProps {
  memberCount: number;
  pendingSessions: number;
  lowStockItems: number;
  openComplaints: number;
  totalRevenue: number;
  leadsCount: number;
  salesData: any[];
}

export function DashboardClient({
  memberCount,
  pendingSessions,
  lowStockItems,
  openComplaints,
  totalRevenue,
  leadsCount,
  salesData
}: DashboardClientProps) {
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);

  const stats = [
    { 
      label: "Active Members", 
      value: memberCount.toString(), 
      trend: "+12%", 
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    { 
      label: "Pending PT", 
      value: pendingSessions.toString(), 
      trend: "5 today", 
      icon: Calendar,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    { 
      label: "Total Revenue", 
      value: `฿${totalRevenue.toLocaleString()}`, 
      trend: "+8.4%", 
      icon: CreditCard,
      color: "text-green-600",
      bg: "bg-green-100"
    },
    { 
      label: "Total Leads", 
      value: leadsCount.toString(), 
      trend: "+2 new", 
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-100"
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of FAT GYM operations and performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => window.dispatchEvent(new CustomEvent("open-global-search"))}>
            <Search className="w-4 h-4" />
          </Button>
          <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
            <DialogTrigger
              className={cn(buttonVariants({ variant: "default" }), "gap-2 px-6")}
            >
              <Plus className="w-4 h-4" /> New Member
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
              </DialogHeader>
              <MemberForm onSuccess={() => setIsMemberDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </CardTitle>
              <div className={cn("p-2 rounded-lg", stat.bg, stat.color)}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={cn("text-xs mt-1 font-semibold", stat.trend.startsWith("+") ? "text-green-600" : "text-primary")}>
                {stat.trend} <span className="text-muted-foreground font-normal">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly income from memberships and PT sessions.</CardDescription>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pl-2">
            <DashboardCharts salesData={salesData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Operational items requiring attention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-xl bg-orange-50 border border-orange-100 group cursor-pointer hover:bg-orange-100 transition-colors">
              <div className="p-2 bg-orange-200 text-orange-700 rounded-lg">
                <Package className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-orange-800">Low Inventory</p>
                <p className="text-xs text-orange-600">{lowStockItems} items are below minimum stock levels</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-orange-400 group-hover:text-orange-600")}
                >
                  <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Inventory Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/inventory" className="w-full">
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                        <Eye className="w-4 h-4" /> View Inventory
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => toast.info("Restock functionality coming soon.")}>
                      <Plus className="w-4 h-4" /> Restock
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-xl bg-red-50 border border-red-100 group cursor-pointer hover:bg-red-100 transition-colors">
              <div className="p-2 bg-red-200 text-red-700 rounded-lg">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-red-800">New Complaints</p>
                <p className="text-xs text-red-600">{openComplaints} unresolved member issues</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-red-400 group-hover:text-red-600")}
                >
                  <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Complaint Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/complaints" className="w-full">
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                        <Eye className="w-4 h-4" /> View Complaints
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => toast.info("Resolution workflow coming soon.")}>
                      <CheckCircle className="w-4 h-4" /> Mark Resolved
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Top Trainers This Week
              </h4>
              <div className="space-y-4">
                {[
                  { name: "Coach Mike", sessions: 24, rating: 4.9 },
                  { name: "Coach Sarah", sessions: 18, rating: 5.0 },
                ].map((trainer, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {trainer.name.split(" ")[1][0]}
                      </div>
                      <span className="text-sm font-medium">{trainer.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold">{trainer.sessions} <span className="text-muted-foreground font-normal">sessions</span></span>
                      <Badge variant="secondary" className="text-[10px] bg-yellow-50 text-yellow-700 border-yellow-100">
                        ⭐ {trainer.rating}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
