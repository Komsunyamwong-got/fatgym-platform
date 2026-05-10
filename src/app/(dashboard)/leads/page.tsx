import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Filter,
  UserPlus,
  Target,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { LeadForm } from "@/components/leads/lead-form";
import { getLeads } from "@/app/actions/leads";
import { LeadsTable } from "@/components/leads/leads-table";

export default async function LeadsPage() {
  const leads = await getLeads();
  const conversionRate = leads.length > 0 ? (leads.filter(l => l.status === "WON").length / leads.length * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Leads & Sales Pipeline</h2>
          <p className="text-muted-foreground text-sm">Track potential members from inquiry to conversion.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <BarChart3 className="w-4 h-4" /> Reports
          </Button>
          <Dialog>
            <DialogTrigger
              render={
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> New Lead
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
              </DialogHeader>
              <LeadForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: leads.length, icon: UserPlus, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "New This Week", value: leads.filter(l => new Date(l.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length, icon: Target, color: "text-purple-500", bg: "bg-purple-50" },
          { label: "Active Pipeline", value: leads.filter(l => l.status !== "WON" && l.status !== "LOST").length, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Conv. Rate", value: `${conversionRate}%`, icon: BarChart3, color: "text-green-500", bg: "bg-green-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl shadow-sm border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-10 bg-muted/50 border-none" placeholder="Search leads by name, email..." />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
          <Button variant="outline" className="flex-1 md:flex-none">Stages</Button>
        </div>
      </div>

      <LeadsTable leads={leads} />
    </div>
  );
}
