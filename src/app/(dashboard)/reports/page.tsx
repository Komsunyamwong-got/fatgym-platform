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
  PieChart as PieChartIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getReportStats } from "@/app/actions/reports";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"; // Reuse existing client chart component

export default async function ReportsPage() {
  const stats = await getReportStats();

  if (!stats) return <div>Error loading reports</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Business Analytics</h2>
          <p className="text-muted-foreground text-sm">Deep dive into gym performance and growth metrics.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" /> Custom Range
          </Button>
          <Button className="gap-2">
            <Download className="w-4 h-4" /> Export All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `฿${(stats.totalRevenue / 1000).toFixed(1)}k`, trend: "+12%", up: true, icon: DollarSign },
          { label: "Active Members", value: stats.activeMembers.toString(), trend: "+5%", up: true, icon: Users },
          { label: "Total Leads", value: stats.leadsCount.toString(), trend: "+2%", up: true, icon: TrendingUp },
          { label: "Avg. Visit", value: "3.2d", trend: "+15%", up: true, icon: BarChart3 },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <div className="flex items-end gap-2 mt-1">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <span className={cn(
                    "text-[10px] font-bold flex items-center mb-1",
                    stat.up ? "text-green-600" : "text-red-600"
                  )}>
                    {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div className="p-2 bg-muted rounded-lg text-primary">
                <stat.icon className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue Growth</CardTitle>
              <CardDescription>Monthly revenue breakdown from real transactions.</CardDescription>
            </div>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-[300px]">
            {stats.salesData.length > 0 ? (
              <DashboardCharts salesData={stats.salesData} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No transaction history yet</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Member Split</CardTitle>
              <CardDescription>Current status distribution.</CardDescription>
            </div>
            <PieChartIcon className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center">
             {/* Note: In a full implementation, I'd create a dedicated PieChart client component */}
             <div className="space-y-4 w-full">
               {stats.memberData.map((m) => (
                 <div key={m.name} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                     <span className="text-sm font-medium">{m.name}</span>
                   </div>
                   <span className="font-bold">{m.value}</span>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Top Selling Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Supplements", rev: "฿54,000" },
                { name: "Drinks", rev: "฿1,860" },
                { name: "Equipment", rev: "฿4,300" },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <span className="text-sm font-medium">{p.name}</span>
                  <div className="text-right">
                    <p className="text-sm font-bold">{p.rev}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Peak Training Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-1 h-32 pt-4">
              {[30, 45, 25, 60, 90, 85, 40, 20, 15].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-primary/20 rounded-t-sm relative group cursor-help" style={{ height: `${h}%` }}>
                    <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm" />
                  </div>
                  <span className="text-[8px] font-bold text-muted-foreground">{i + 8}h</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
