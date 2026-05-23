"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter,
  UserPlus,
  Target,
  BarChart3,
  TrendingUp,
  Mail,
  Phone,
  MessageSquare,
  MoreHorizontal,
  FolderKanban,
  CheckCircle2,
  Calendar,
  DollarSign,
  UserCheck,
  Send,
  Loader2
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { LeadForm } from "@/components/leads/lead-form";
import { LeadsTable } from "@/components/leads/leads-table";
import { updateLeadStatus } from "@/app/actions/leads";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  NEW_LEAD: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-purple-100 text-purple-700",
  INTERESTED: "bg-amber-100 text-amber-700",
  TRIAL_BOOKED: "bg-sky-100 text-sky-700",
  VISITED: "bg-teal-100 text-teal-700",
  PROPOSAL_SENT: "bg-indigo-100 text-indigo-700",
  HOT_LEAD: "bg-rose-100 text-rose-700",
  WON: "bg-green-100 text-green-700",
  LOST: "bg-red-100 text-red-700",
  FOLLOW_UP_LATER: "bg-zinc-100 text-zinc-700",
};

interface LeadsClientProps {
  initialLeads: any[];
}

export function LeadsClient({ initialLeads }: LeadsClientProps) {
  // Local state for instant updates & filtering
  const [leadsList, setLeadsList] = useState<any[]>(initialLeads);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedSource, setSelectedSource] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"list" | "stages">("list");
  
  // Dialog controls
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Follow Up input state
  const [followUpNoteText, setFollowUpNoteText] = useState("");
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Re-calculate Stats dynamically based on leadsList
  const totalLeads = leadsList.length;
  const newThisWeek = leadsList.filter(l => new Date(l.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
  const activePipeline = leadsList.filter(l => l.status !== "WON" && l.status !== "LOST").length;
  const wonCount = leadsList.filter(l => l.status === "WON").length;
  const conversionRate = totalLeads > 0 ? ((wonCount / totalLeads) * 100).toFixed(1) : "0.0";

  // Filtered Leads
  const filteredLeads = leadsList.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchQuery)) ||
      (lead.interest && lead.interest.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.source && lead.source.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === "ALL" || lead.status === selectedStatus;
    const matchesSource = selectedSource === "ALL" || lead.source === selectedSource;

    return matchesSearch && matchesStatus && matchesSource;
  });

  // Unique sources for the source filter select
  const uniqueSources = Array.from(new Set(leadsList.map(l => l.source).filter(Boolean)));

  // Handle status update to DB and local state
  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    const res = await updateLeadStatus(leadId, newStatus as any);
    setIsUpdatingStatus(false);
    
    if (res.success) {
      setLeadsList(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead((prev: any) => ({ ...prev, status: newStatus }));
      }
      toast.success("Lead status updated successfully");
    } else {
      toast.error("Failed to update status");
    }
  };

  // Handle adding a follow-up note locally for presentation (simulate DB rel)
  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpNoteText.trim() || !selectedLead) return;

    setIsSubmittingFollowUp(true);
    
    // Simulate inserting follow-up note into the selected lead object
    const newNote = {
      id: `F-${Date.now()}`,
      note: followUpNoteText.trim(),
      createdAt: new Date().toISOString()
    };

    setLeadsList(prev => prev.map(l => {
      if (l.id === selectedLead.id) {
        return {
          ...l,
          followUps: [newNote, ...(l.followUps || [])]
        };
      }
      return l;
    }));

    setSelectedLead((prev: any) => ({
      ...prev,
      followUps: [newNote, ...(prev.followUps || [])]
    }));

    setFollowUpNoteText("");
    setIsSubmittingFollowUp(false);
    toast.success("Follow-up note added!");
  };

  // Kanban Stage Columns
  const kanbanStages = [
    { title: "Inquiry", statuses: ["NEW_LEAD", "CONTACTED"], color: "bg-blue-500/10 text-blue-700 border-blue-200" },
    { title: "Nurturing", statuses: ["INTERESTED", "TRIAL_BOOKED"], color: "bg-sky-500/10 text-sky-700 border-sky-200" },
    { title: "Active Pipeline", statuses: ["VISITED", "PROPOSAL_SENT", "HOT_LEAD", "FOLLOW_UP_LATER"], color: "bg-rose-500/10 text-rose-700 border-rose-200" },
    { title: "Closed (Won/Lost)", statuses: ["WON", "LOST"], color: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Leads & Sales Pipeline</h2>
          <p className="text-muted-foreground text-sm">Track potential members from inquiry to conversion.</p>
        </div>
        <div className="flex gap-2">
          
          {/* Sales Reports Dialog */}
          <Dialog open={isReportsOpen} onOpenChange={setIsReportsOpen}>
            <DialogTrigger
              render={
                <Button variant="outline" className="gap-2 font-semibold hover:scale-105 active:scale-95 transition-all">
                  <BarChart3 className="w-4 h-4" /> Reports
                </Button>
              }
            />
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Sales Pipeline Analytics</DialogTitle>
                <DialogDescription>Overview of conversion metrics and acquisition channels.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-2 text-sm text-zinc-800">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border bg-card/60 space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-bold">Total Closed Won</p>
                    <p className="text-2xl font-black text-emerald-600 flex items-center gap-1.5">
                      <UserCheck className="w-6 h-6 text-emerald-500" /> {wonCount} Members
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border bg-card/60 space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-bold">Conversion Rate</p>
                    <p className="text-2xl font-black text-primary flex items-center gap-1.5">
                      <TrendingUp className="w-6 h-6 text-primary" /> {conversionRate}%
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Leads by Status Breakdown</h4>
                  <div className="space-y-1.5">
                    {Object.keys(statusStyles).map(status => {
                      const count = leadsList.filter(l => l.status === status).length;
                      const percentage = totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(0) : 0;
                      return (
                        <div key={status} className="flex justify-between items-center p-2 rounded-lg border bg-card text-xs">
                          <Badge className={cn("border-none text-[9px] font-black uppercase", statusStyles[status])}>
                            {status.replace("_", " ")}
                          </Badge>
                          <div className="flex items-center gap-2 font-bold text-zinc-800">
                            <span>{count}</span>
                            <span className="text-[10px] text-muted-foreground">({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter showCloseButton />
            </DialogContent>
          </Dialog>

          {/* New Lead Dialog Form */}
          <Dialog open={isNewLeadOpen} onOpenChange={setIsNewLeadOpen}>
            <DialogTrigger
              render={
                <Button className="gap-2 font-semibold hover:scale-105 active:scale-95 transition-all shadow-sm">
                  <Plus className="w-4 h-4" /> New Lead
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
                <DialogDescription>Input potential client interest. All validation is in English.</DialogDescription>
              </DialogHeader>
              
              {/* Force refetch update on form submit */}
              <LeadForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Numerical Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: totalLeads, icon: UserPlus, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "New This Week", value: newThisWeek, icon: Target, color: "text-purple-500", bg: "bg-purple-50" },
          { label: "Active Pipeline", value: activePipeline, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Conv. Rate", value: `${conversionRate}%`, icon: BarChart3, color: "text-green-500", bg: "bg-green-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold mt-1 text-zinc-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reactive Search & Filter bar circled by user */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl shadow-sm border">
        
        {/* Real-time search input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-none font-medium placeholder:font-normal placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary text-zinc-800" 
            placeholder="Search leads by name, email, interest..." 
          />
        </div>

        {/* Action button toggles */}
        <div className="flex gap-2 w-full md:w-auto">
          
          {/* Advanced Filters Popover Dialog */}
          <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <DialogTrigger
              render={
                <Button 
                  variant="outline" 
                  className={cn(
                    "flex-1 md:flex-none gap-2 font-semibold transition-all",
                    (selectedStatus !== "ALL" || selectedSource !== "ALL") && "border-primary bg-primary/5 text-primary"
                  )}
                >
                  <Filter className="w-4 h-4" /> Filters
                </Button>
              }
            />
            <DialogContent className="sm:max-w-xs">
              <DialogHeader>
                <DialogTitle>Filter Leads</DialogTitle>
                <DialogDescription>Narrow down lead lists by source or pipeline stage.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Status Stage</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="ALL">All Stages</option>
                    {Object.keys(statusStyles).map(st => (
                      <option key={st} value={st}>{st.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Acquisition Source</label>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="ALL">All Sources</option>
                    {uniqueSources.map(src => (
                      <option key={src} value={src}>{src}</option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="secondary" 
                  className="w-full text-xs font-bold"
                  onClick={() => {
                    setSelectedStatus("ALL");
                    setSelectedSource("ALL");
                    setIsFiltersOpen(false);
                    toast.success("Filters reset successfully");
                  }}
                >
                  Reset Filters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Pipeline Stages Switcher button */}
          <Button 
            variant="outline" 
            className={cn(
              "flex-1 md:flex-none font-semibold transition-all gap-1.5",
              viewMode === "stages" && "bg-zinc-900 text-white hover:bg-zinc-800"
            )}
            onClick={() => setViewMode(prev => prev === "list" ? "stages" : "list")}
          >
            <FolderKanban className="w-4 h-4" /> Stages
          </Button>
        </div>
      </div>

      {/* Main Content Area: sifting between Table List View & Kanban Board Stages */}
      {viewMode === "list" ? (
        
        /* Table View */
        <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
          <ResponsiveDataTable
            data={filteredLeads}
            columns={[
              {
                header: "Lead Name",
                accessorKey: "name",
                cell: (lead: any) => (
                  <div 
                    className="flex flex-col cursor-pointer group"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <span className="font-bold text-zinc-900 group-hover:text-primary transition-colors">{lead.name}</span>
                    <span className="text-[9px] font-semibold text-muted-foreground tracking-wider uppercase mt-0.5">{lead.id.substring(0, 10)}</span>
                  </div>
                ),
              },
              {
                header: "Contact Info",
                accessorKey: "phone",
                cell: (lead: any) => (
                  <div className="flex flex-col gap-1 text-zinc-800">
                    <span className="text-xs flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-muted-foreground" /> {lead.phone || "-"}</span>
                    <span className="text-xs flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-muted-foreground" /> {lead.email || "-"}</span>
                  </div>
                ),
              },
              {
                header: "Pipeline Status",
                accessorKey: "status",
                cell: (lead: any) => (
                  <Badge 
                    variant="outline"
                    className={cn(
                      "border-none font-black text-[9px] uppercase tracking-wider",
                      statusStyles[lead.status] || "bg-zinc-100 text-zinc-700"
                    )}
                  >
                    {lead.status.replace("_", " ")}
                  </Badge>
                ),
              },
              {
                header: "Fitness Interest",
                accessorKey: "interest",
                cell: (lead: any) => <span className="font-semibold text-zinc-800">{lead.interest || "-"}</span>
              },
              {
                header: "Source",
                accessorKey: "source",
                cell: (lead: any) => <span className="font-semibold text-zinc-700 text-xs">{lead.source || "-"}</span>
              },
              {
                header: "Created At",
                accessorKey: "createdAt",
                cell: (lead: any) => (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                )
              },
              {
                header: "Action",
                accessorKey: "id",
                cell: (lead: any) => (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-primary/10 hover:text-primary"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                ),
              },
            ]}
            mobileRender={(lead: any) => (
              <div 
                className="p-4 space-y-3 border-b last:border-0 hover:bg-muted/10 cursor-pointer"
                onClick={() => setSelectedLead(lead)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-zinc-900">{lead.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{lead.interest} • {lead.source}</p>
                  </div>
                  <Badge 
                    className={cn(
                      "border-none font-black text-[9px] uppercase",
                      statusStyles[lead.status]
                    )}
                  >
                    {lead.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            )}
          />
        </div>
      ) : (
        
        /* Kanban Stages Board */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {kanbanStages.map((stage) => {
            const stageLeads = filteredLeads.filter(l => stage.statuses.includes(l.status));
            return (
              <div key={stage.title} className="flex flex-col gap-3 min-w-[250px] bg-muted/30 p-3 rounded-xl border border-dashed">
                
                {/* Column Title */}
                <div className="flex justify-between items-center px-1">
                  <h4 className="font-black text-xs uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                    {stage.title}
                  </h4>
                  <Badge className="bg-zinc-200 text-zinc-700 border-none font-bold text-[10px]">{stageLeads.length}</Badge>
                </div>

                {/* Column Cards */}
                <div className="space-y-2 flex-grow overflow-y-auto max-h-[500px]">
                  {stageLeads.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                      No leads in this stage.
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <Card 
                        key={lead.id} 
                        className="border-none shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <CardContent className="p-3.5 space-y-3">
                          <div className="flex justify-between items-start gap-1">
                            <h5 className="font-bold text-sm text-zinc-900 line-clamp-1">{lead.name}</h5>
                            <Badge 
                              className={cn(
                                "border-none text-[8px] font-black uppercase tracking-normal shrink-0",
                                statusStyles[lead.status]
                              )}
                            >
                              {lead.status.replace("_", " ")}
                            </Badge>
                          </div>
                          
                          <p className="text-[11px] text-muted-foreground leading-none flex items-center gap-1">
                            <Target className="w-3.5 h-3.5" /> {lead.interest || "General Inquiry"}
                          </p>

                          <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-500 border-t pt-2 mt-1">
                            <span>{lead.source}</span>
                            <span>{new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Advanced Lead Detail Slider Dialog */}
      <Dialog open={selectedLead !== null} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedLead && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start mr-6">
                  <div>
                    <DialogTitle className="text-xl font-extrabold text-zinc-900">{selectedLead.name}</DialogTitle>
                    <p className="text-[10px] font-black text-muted-foreground tracking-wider uppercase mt-1">Lead ID: {selectedLead.id}</p>
                  </div>
                  <Badge className={cn("border-none text-[10px] font-black uppercase tracking-wider", statusStyles[selectedLead.status])}>
                    {selectedLead.status.replace("_", " ")}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4 my-2 text-sm text-zinc-800">
                {/* Contact information card */}
                <div className="grid grid-cols-2 gap-4 bg-muted/40 p-3 rounded-xl border">
                  <div>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Phone Number</p>
                    <p className="text-xs font-bold text-zinc-900 mt-0.5">{selectedLead.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Email Address</p>
                    <p className="text-xs font-bold text-zinc-900 mt-0.5">{selectedLead.email || "-"}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Fitness Goal / Focus</p>
                    <p className="text-xs font-bold text-zinc-900 mt-0.5">{selectedLead.interest || "-"}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Acquisition Channel</p>
                    <p className="text-xs font-bold text-zinc-900 mt-0.5">{selectedLead.source || "-"}</p>
                  </div>
                </div>

                {/* Status Updater Select */}
                <div className="border-t pt-3 space-y-2">
                  <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                    Update Pipeline Stage
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedLead.status}
                      disabled={isUpdatingStatus}
                      onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)}
                      className="flex-1 p-2 rounded-lg border text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {Object.keys(statusStyles).map(st => (
                        <option key={st} value={st}>{st.replace("_", " ")}</option>
                      ))}
                    </select>
                    {isUpdatingStatus && <Loader2 className="w-5 h-5 animate-spin text-primary self-center" />}
                  </div>
                </div>

                {/* Follow Ups & Notes logs */}
                <div className="space-y-2.5 border-t pt-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-primary" /> Staff Follow-Up Notes
                  </h4>

                  {/* Add new note Form */}
                  <form onSubmit={handleAddFollowUp} className="flex gap-2">
                    <input 
                      type="text"
                      value={followUpNoteText}
                      onChange={(e) => setFollowUpNoteText(e.target.value)}
                      placeholder="Type a checking progress note..."
                      className="flex-1 p-2 border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Button type="submit" size="sm" className="font-bold text-xs px-3" disabled={!followUpNoteText.trim() || isSubmittingFollowUp}>
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </form>

                  {/* Note timeline list */}
                  <div className="space-y-2 max-h-[160px] overflow-y-auto mt-2">
                    {!selectedLead.followUps || selectedLead.followUps.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2 text-center border border-dashed rounded-lg">No follow up notes logged.</p>
                    ) : (
                      selectedLead.followUps.map((fn: any) => (
                        <div key={fn.id} className="p-2.5 rounded-lg border bg-card text-xs space-y-1">
                          <p className="text-zinc-800 font-medium leading-relaxed">{fn.note}</p>
                          <p className="text-[9px] text-muted-foreground font-semibold flex items-center gap-1 justify-end">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(fn.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="bg-zinc-50 border-t mt-4">
                <DialogClose render={<Button variant="outline" className="text-xs font-semibold" />}>
                  Close
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
