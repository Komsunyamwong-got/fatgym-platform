"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  ShoppingBag,
  Clock,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReportsClientProps {
  stats: {
    totalRevenue: number;
    activeMembers: number;
    leadsCount: number;
    avgVisit: string;
    salesData: any[];
    memberData: any[];
    categoryData: any[];
    peakHoursData: any[];
    paymentDetails: any[];
  };
}

export function ReportsClient({ stats }: ReportsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get("range") || "all";
  const [isExporting, setIsExporting] = useState(false);

  // Range text mapping helper
  const rangeLabels: Record<string, string> = {
    "30d": "Last 30 Days",
    "90d": "Last 3 Months",
    "180d": "Last 6 Months",
    "all": "All Time"
  };

  // Change search parameter scope dynamically
  const handleRangeChange = (rangeKey: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", rangeKey);
    router.push(`/reports?${params.toString()}`);
    toast.success(`Reports range filtered by ${rangeLabels[rangeKey]}`);
  };

  // High-fidelity dynamic billing transaction CSV exporter
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const headers = [
        "Payment ID", 
        "Receipt Number",
        "Member Name", 
        "Member ID", 
        "Email", 
        "Amount (THB)", 
        "Payment Method", 
        "Status", 
        "Date Logged"
      ];

      const rows = stats.paymentDetails.map(p => [
        p.id,
        p.receiptNumber || "N/A",
        p.purchase.member.user.name,
        p.purchase.member.memberId,
        p.purchase.member.user.email,
        p.amount,
        p.method,
        p.status,
        new Date(p.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      ]);

      const csvContent = "\uFEFF" + [
        headers.join(","),
        ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `fatgym_billing_report_${currentRange}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Billing transaction report downloaded successfully!");
    } catch (error) {
      console.error("Failed to export billing CSV:", error);
      toast.error("An error occurred during billing report export.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header bar and filters circled by user */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Business Analytics</h2>
          <p className="text-muted-foreground text-sm">Deep dive into gym performance and growth metrics.</p>
        </div>
        
        {/* Circled controls trigger */}
        <div className="flex gap-2 shrink-0">
          
          {/* Working Custom Range Dropdown Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="gap-2 font-semibold hover:bg-muted transition-all">
                  <Calendar className="w-4 h-4 text-zinc-500" /> 
                  <span>{rangeLabels[currentRange] || "All Time"}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={() => handleRangeChange("30d")}
                className={cn("cursor-pointer font-medium text-xs", currentRange === "30d" && "text-primary font-bold bg-primary/5")}
              >
                Last 30 Days
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleRangeChange("90d")}
                className={cn("cursor-pointer font-medium text-xs", currentRange === "90d" && "text-primary font-bold bg-primary/5")}
              >
                Last 3 Months
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleRangeChange("180d")}
                className={cn("cursor-pointer font-medium text-xs", currentRange === "180d" && "text-primary font-bold bg-primary/5")}
              >
                Last 6 Months
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleRangeChange("all")}
                className={cn("cursor-pointer font-medium text-xs", currentRange === "all" && "text-primary font-bold bg-primary/5")}
              >
                All Time
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Working Dynamic CSV Exporter */}
          <Button 
            onClick={handleExportCSV}
            disabled={isExporting || stats.paymentDetails.length === 0}
            className="gap-2 font-bold hover:scale-105 active:scale-95 transition-all shadow-sm bg-primary"
          >
            <Download className="w-4 h-4" /> 
            {isExporting ? "Exporting..." : "Export All"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Total Revenue", 
            value: `฿${(stats.totalRevenue).toLocaleString("en-US", { maximumFractionDigits: 0 })}`, 
            trend: currentRange === "all" ? "+12% total" : "+8% range", 
            up: true, 
            icon: DollarSign,
            colorClass: "bg-emerald-50 text-emerald-600 border-emerald-100"
          },
          { 
            label: "Active Members", 
            value: stats.activeMembers.toString(), 
            trend: "+5% month", 
            up: true, 
            icon: Users,
            colorClass: "bg-blue-50 text-blue-600 border-blue-100"
          },
          { 
            label: "Total Leads", 
            value: stats.leadsCount.toString(), 
            trend: "+2% week", 
            up: true, 
            icon: TrendingUp,
            colorClass: "bg-purple-50 text-purple-600 border-purple-100"
          },
          { 
            label: "Avg. Visit", 
            value: `${stats.avgVisit}d`, 
            trend: "+15% activity", 
            up: true, 
            icon: BarChart3,
            colorClass: "bg-orange-50 text-orange-600 border-orange-100"
          },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm border border-zinc-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <div className="flex items-end gap-2 mt-1.5">
                  <p className="text-2xl font-black text-zinc-900 leading-none">{stat.value}</p>
                  <span className={cn(
                    "text-[10px] font-extrabold flex items-center mb-0.5",
                    stat.up ? "text-green-600" : "text-red-600"
                  )}>
                    {stat.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div className={cn("p-2.5 rounded-xl border", stat.colorClass)}>
                <stat.icon className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Growth line/area chart */}
        <Card className="lg:col-span-2 border-none shadow-sm border border-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-zinc-950">Revenue Growth</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Monthly revenue breakdown from real transaction payments.</CardDescription>
            </div>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-[300px]">
            {stats.salesData.length > 0 ? (
              <DashboardCharts salesData={stats.salesData} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl py-10 bg-muted/10">
                <DollarSign className="w-8 h-8 text-muted-foreground opacity-20 mb-2" />
                <span className="text-xs font-semibold">No paid transaction history in this range yet</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member status Split */}
        <Card className="border-none shadow-sm border border-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-zinc-950">Member Split</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Current system status distribution.</CardDescription>
            </div>
            <PieChartIcon className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col justify-center">
             <div className="space-y-3.5 w-full">
               {stats.memberData.map((m) => (
                 <div key={m.name} className="flex items-center justify-between p-3 rounded-xl border bg-muted/20 border-zinc-100 hover:scale-[1.01] transition-transform">
                   <div className="flex items-center gap-2.5">
                     <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: m.color }} />
                     <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">{m.name}</span>
                   </div>
                   <span className="font-extrabold text-sm text-zinc-950">{m.value}</span>
                 </div>
               ))}
               {stats.memberData.length === 0 && (
                 <div className="text-center text-xs text-muted-foreground py-6">No member status records found</div>
               )}
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories and Peak Training Hours Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Real Dynamic Categories Sales Revenue */}
        <Card className="border-none shadow-sm border border-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-zinc-950">Top Selling Categories</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Aggregated database category revenues (Packages & Sales).</CardDescription>
            </div>
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3.5">
              {stats.categoryData.map((cat, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border bg-muted/20 border-zinc-100 hover:scale-[1.01] transition-transform">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 text-primary text-[10px] font-black">{i + 1}</div>
                    <span className="text-xs font-bold text-zinc-700">{cat.name}</span>
                  </div>
                  <span className="font-black text-sm text-zinc-950">฿{(cat.rev).toLocaleString("en-US")}</span>
                </div>
              ))}
              {stats.categoryData.length === 0 && (
                <div className="text-center text-xs text-muted-foreground py-6 border border-dashed rounded-lg bg-muted/10">No category purchases recorded</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Real Dynamic Peak Training Hours from PT and Class Bookings */}
        <Card className="border-none shadow-sm border border-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-zinc-950">Peak Training Hours</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Real hourly occupancy loads based on bookings & sessions.</CardDescription>
            </div>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-1 h-36 pt-4 border-b border-zinc-100 pb-2">
              {stats.peakHoursData.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div 
                    className="w-full bg-primary/25 hover:bg-primary transition-all rounded-t-lg relative group cursor-pointer border border-primary/20 hover:scale-x-105" 
                    style={{ height: `${Math.max(4, item.percentage)}%` }}
                  >
                    {/* Tooltip on hover showing count */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-zinc-950 text-white text-[9px] font-bold px-2 py-1 rounded shadow-md z-30 pointer-events-none whitespace-nowrap">
                      {item.count} activity logs
                    </div>
                  </div>
                  <span className="text-[8px] font-bold text-muted-foreground shrink-0">{item.hour}h</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-[10px] font-medium text-muted-foreground justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Hover bars to view exact check-ins & session bookings count</span>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
