"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter,
  AlertCircle,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  Info,
  Trash,
  Archive,
  User,
  Activity,
  FileText,
  Calendar,
  X,
  Sparkles
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ComplaintForm } from "@/components/complaints/complaint-form";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { updateComplaintStatus, resolveComplaint, deleteComplaint } from "@/app/actions/complaints";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ComplaintsClientProps {
  initialComplaints: any[];
}

export function ComplaintsClient({ initialComplaints }: ComplaintsClientProps) {
  const [complaintList, setComplaintList] = useState<any[]>(initialComplaints);
  
  // Real-time Controls & Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ACTIVE"); // ACTIVE, OPEN, IN_PROGRESS, RESOLVED, CLOSED
  
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Dialog Action states
  const [activeComplaint, setActiveComplaint] = useState<any>(null);
  const [dialogMode, setDialogMode] = useState<"details" | "resolve" | "delete" | null>(null);
  
  // Form input state
  const [resolutionInput, setResolutionInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Strictly English Date Formatter (Gregorian Calendar)
  const formatEnglishDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Re-calculate KPI metrics dynamically from local state
  const openCount = complaintList.filter(c => c.status === "OPEN").length;
  const inProgressCount = complaintList.filter(c => c.status === "IN_PROGRESS").length;
  const resolvedCount = complaintList.filter(c => c.status === "RESOLVED").length;

  // Filtered tickets
  const filteredComplaints = complaintList.filter(ticket => {
    const searchStr = searchQuery.toLowerCase();
    const matchesSearch = 
      ticket.member.user.name.toLowerCase().includes(searchStr) ||
      ticket.member.memberId.toLowerCase().includes(searchStr) ||
      ticket.type.toLowerCase().includes(searchStr) ||
      (ticket.description && ticket.description.toLowerCase().includes(searchStr)) ||
      ticket.id.toLowerCase().includes(searchStr);

    let matchesStatus = true;
    if (selectedStatus === "ACTIVE") {
      matchesStatus = ticket.status !== "CLOSED";
    } else if (selectedStatus !== "ALL") {
      matchesStatus = ticket.status === selectedStatus;
    }

    const matchesType = selectedType === "ALL" || ticket.type === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Unique types helper
  const uniqueTypes = Array.from(new Set(complaintList.map(c => c.type).filter(Boolean)));

  // Handle direct Status Updates (e.g. Mark In Progress, Close)
  const handleStatusUpdate = async (id: string, nextStatus: any) => {
    setIsSubmitting(true);
    const res = await updateComplaintStatus(id, nextStatus);
    setIsSubmitting(false);

    if (res.success && res.data) {
      setComplaintList(prev => prev.map(c => c.id === id ? res.data : c));
      toast.success(`Ticket marked as ${nextStatus.replace(/_/g, " ")} successfully!`);
      
      // Sync active item if currently viewing details
      if (activeComplaint && activeComplaint.id === id) {
        setActiveComplaint(res.data);
      }
    } else {
      toast.error("Failed to update ticket status");
    }
  };

  // Handle Ticket Resolution submission
  const handleResolveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint || !resolutionInput.trim()) return;

    setIsSubmitting(true);
    const res = await resolveComplaint(activeComplaint.id, resolutionInput.trim());
    setIsSubmitting(false);

    if (res.success && res.data) {
      setComplaintList(prev => prev.map(c => c.id === activeComplaint.id ? res.data : c));
      toast.success("Ticket resolved successfully!");
      setDialogMode(null);
      setActiveComplaint(null);
      setResolutionInput("");
    } else {
      toast.error("Failed to resolve ticket");
    }
  };

  // Handle Ticket Deletion
  const handleDeleteTicket = async () => {
    if (!activeComplaint) return;

    setIsSubmitting(true);
    const res = await deleteComplaint(activeComplaint.id);
    setIsSubmitting(false);

    if (res.success) {
      setComplaintList(prev => prev.filter(c => c.id !== activeComplaint.id));
      toast.success("Ticket deleted successfully");
      setDialogMode(null);
      setActiveComplaint(null);
    } else {
      toast.error("Failed to delete ticket");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Member Complaints</h2>
          <p className="text-muted-foreground text-sm">Manage and resolve member feedback and issues.</p>
        </div>
        
        {/* New Ticket Trigger */}
        <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
          <DialogTrigger
            render={
              <Button className="gap-2 font-semibold hover:scale-105 active:scale-95 transition-all shadow-sm">
                <Plus className="w-4 h-4" /> New Ticket
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Record Complaint</DialogTitle>
              <DialogDescription>Submit a new customer service feedback ticket. Form is strictly in English.</DialogDescription>
            </DialogHeader>
            <ComplaintForm onSuccess={(newComplaint) => {
              setComplaintList(prev => [newComplaint, ...prev]);
              setIsNewTicketOpen(false);
              toast.success(`Successfully logged ticket for ${newComplaint.member.user.name}!`);
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-red-50/50 border border-red-100/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Open Tickets</p>
              <p className="text-2xl font-black text-red-900">{openCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-blue-50/50 border border-blue-100/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">In Progress</p>
              <p className="text-2xl font-black text-blue-900">{inProgressCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-green-50/50 border border-green-100/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-green-800 uppercase tracking-wider">Resolved</p>
              <p className="text-2xl font-black text-green-900">{resolvedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters toolbar circled by user */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl shadow-sm border">
        
        {/* Real-time search bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-none font-medium text-zinc-800 placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary" 
            placeholder="Search complaints by member, ID or content..." 
          />
        </div>

        {/* Filters control block */}
        <div className="flex gap-2 w-full md:w-auto">
          
          {/* Advanced Filter Modal */}
          <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <DialogTrigger
              render={
                <Button 
                  variant="outline" 
                  className={cn(
                    "flex-1 md:flex-none gap-2 font-semibold transition-all",
                    (selectedStatus !== "ACTIVE" || selectedType !== "ALL") && "border-primary bg-primary/5 text-primary"
                  )}
                >
                  <Filter className="w-4 h-4" /> Filters
                </Button>
              }
            />
            <DialogContent className="sm:max-w-xs">
              <DialogHeader>
                <DialogTitle>Filter Tickets</DialogTitle>
                <DialogDescription>Filter complaints by ticket status or issues category.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Status Scope</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900"
                  >
                    <option value="ACTIVE">Active Tickets</option>
                    <option value="ALL">All Statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed/Archived</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Complaint Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900"
                  >
                    <option value="ALL">All Types</option>
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="secondary" 
                  className="w-full text-xs font-bold"
                  onClick={() => {
                    setSelectedStatus("ACTIVE");
                    setSelectedType("ALL");
                    setIsFiltersOpen(false);
                    toast.success("Filters reset successfully");
                  }}
                >
                  Reset Filters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Toggle showing Archived/Closed tickets */}
          <Button
            variant="outline"
            className={cn(
              "flex-1 md:flex-none font-semibold transition-all gap-1.5",
              selectedStatus === "CLOSED" && "bg-zinc-900 text-white hover:bg-zinc-800"
            )}
            onClick={() => setSelectedStatus(prev => prev === "CLOSED" ? "ACTIVE" : "CLOSED")}
          >
            <Archive className="w-4 h-4" /> Archives
          </Button>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
        <ResponsiveDataTable
          data={filteredComplaints}
          columns={[
            {
              header: "Member",
              accessorKey: "memberId",
              cell: (ticket: any) => (
                <div 
                  className="flex flex-col cursor-pointer group"
                  onClick={() => {
                    setActiveComplaint(ticket);
                    setDialogMode("details");
                  }}
                >
                  <span className="font-bold text-zinc-900 group-hover:text-primary transition-colors">{ticket.member.user.name}</span>
                  <span className="text-[9px] font-semibold text-muted-foreground tracking-wider uppercase mt-0.5">{ticket.member.memberId}</span>
                </div>
              ),
            },
            {
              header: "Type",
              accessorKey: "type",
              cell: (ticket: any) => (
                <Badge variant="secondary" className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 bg-zinc-100 text-zinc-700">
                  {ticket.type}
                </Badge>
              ),
            },
            {
              header: "Status",
              accessorKey: "status",
              cell: (ticket: any) => (
                <Badge 
                  className={cn(
                    "border-none font-black text-[9px] uppercase tracking-wider px-2 py-0.5",
                    ticket.status === "RESOLVED" ? "bg-green-100 text-green-700" : 
                    ticket.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                    ticket.status === "CLOSED" ? "bg-zinc-100 text-zinc-600" :
                    "bg-orange-100 text-orange-700"
                  )}
                >
                  {ticket.status.replace(/_/g, " ")}
                </Badge>
              ),
            },
            {
              header: "Created",
              accessorKey: "createdAt",
              cell: (ticket: any) => (
                <span className="font-medium text-zinc-600 text-xs shrink-0 block">
                  {formatEnglishDateTime(ticket.createdAt)}
                </span>
              ),
            },
            {
              header: "Actions",
              accessorKey: "id",
              cell: (ticket: any) => (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-all rounded-lg">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="font-bold text-xs uppercase text-muted-foreground tracking-wide">Ticket Management</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700"
                        onClick={() => {
                          setActiveComplaint(ticket);
                          setDialogMode("details");
                        }}
                      >
                        <Info className="w-4 h-4 text-muted-foreground" /> View Details
                      </DropdownMenuItem>

                      {ticket.status === "OPEN" && (
                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700"
                          onClick={() => handleStatusUpdate(ticket.id, "IN_PROGRESS")}
                        >
                          <Clock className="w-4 h-4 text-blue-500 animate-spin" style={{ animationDuration: '3s' }} /> Mark In Progress
                        </DropdownMenuItem>
                      )}

                      {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700"
                          onClick={() => {
                            setActiveComplaint(ticket);
                            setDialogMode("resolve");
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Resolve Ticket
                        </DropdownMenuItem>
                      )}

                      {ticket.status !== "CLOSED" && (
                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700"
                          onClick={() => handleStatusUpdate(ticket.id, "CLOSED")}
                        >
                          <Archive className="w-4 h-4 text-amber-500" /> Archive/Close Ticket
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive flex items-center gap-2 cursor-pointer text-xs font-bold focus:bg-red-50 focus:text-red-700"
                      onClick={() => {
                        setActiveComplaint(ticket);
                        setDialogMode("delete");
                      }}
                    >
                      <Trash className="w-4 h-4" /> Delete Ticket
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            },
          ]}
          mobileRender={(ticket: any) => (
            <div 
              className="p-4 space-y-3 border-b last:border-0 hover:bg-muted/10 cursor-pointer"
              onClick={() => {
                setActiveComplaint(ticket);
                setDialogMode("details");
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-zinc-900">{ticket.member.user.name}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{formatEnglishDateTime(ticket.createdAt)}</p>
                </div>
                <Badge 
                  className={cn(
                    "border-none font-black text-[9px] uppercase px-2 py-0.5",
                    ticket.status === "RESOLVED" ? "bg-green-100 text-green-700" : 
                    ticket.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                    ticket.status === "CLOSED" ? "bg-zinc-100 text-zinc-600" :
                    "bg-orange-100 text-orange-700"
                  )}
                >
                  {ticket.status.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>
          )}
        />
      </div>

      {/* Advanced Action Dialogs Manager */}
      <Dialog 
        open={activeComplaint !== null && dialogMode !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setActiveComplaint(null);
            setDialogMode(null);
            setResolutionInput("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          {activeComplaint && (
            <>
              {/* DETAILS SHEET VIEW */}
              {dialogMode === "details" && (
                <>
                  <DialogHeader>
                    <div className="flex justify-between items-start mr-6">
                      <div>
                        <DialogTitle className="text-lg font-black text-zinc-900">{activeComplaint.member.user.name}</DialogTitle>
                        <p className="text-[9px] font-mono text-muted-foreground uppercase mt-1">Ticket ID: {activeComplaint.id}</p>
                      </div>
                      <Badge className="bg-zinc-100 text-zinc-700 border-none font-black text-[9px] uppercase px-2 py-0.5">{activeComplaint.type}</Badge>
                    </div>
                  </DialogHeader>

                  <div className="space-y-4 my-2 text-xs text-zinc-800">
                    <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-xl border">
                      <div>
                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Member ID</p>
                        <p className="text-xs font-bold text-zinc-900 mt-0.5">{activeComplaint.member.memberId}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Ticket Status</p>
                        <Badge 
                          className={cn(
                            "border-none font-black text-[8px] uppercase tracking-wider px-1.5 py-0.2 mt-0.5",
                            activeComplaint.status === "RESOLVED" ? "bg-green-100 text-green-700" : 
                            activeComplaint.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                            activeComplaint.status === "CLOSED" ? "bg-zinc-100 text-zinc-600" :
                            "bg-orange-100 text-orange-700"
                          )}
                        >
                          {activeComplaint.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Logged DateTime</p>
                        <p className="text-xs font-bold text-zinc-900 mt-0.5">{formatEnglishDateTime(activeComplaint.createdAt)}</p>
                      </div>
                    </div>

                    <div className="space-y-1 bg-zinc-50 border p-4 rounded-xl">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Issue Description</p>
                      <p className="text-xs font-semibold text-zinc-800 leading-relaxed mt-1">{activeComplaint.description}</p>
                    </div>

                    {activeComplaint.resolution && (
                      <div className="space-y-1 bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                        <p className="text-[9px] uppercase font-bold text-emerald-800 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" /> Resolution Notes
                        </p>
                        <p className="text-xs font-bold text-emerald-950 mt-1 leading-relaxed">{activeComplaint.resolution}</p>
                        {activeComplaint.closedAt && (
                          <p className="text-[8px] text-emerald-700/80 font-semibold mt-2">Resolved on: {formatEnglishDateTime(activeComplaint.closedAt)}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <DialogFooter className="bg-zinc-50 border-t mt-4 pt-3 flex gap-2">
                    {activeComplaint.status !== "RESOLVED" && activeComplaint.status !== "CLOSED" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs font-bold gap-1.5"
                        onClick={() => setDialogMode("resolve")}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Resolve Ticket
                      </Button>
                    )}
                    <DialogClose render={<Button variant="secondary" size="sm" className="text-xs font-semibold" />} />
                  </DialogFooter>
                </>
              )}

              {/* RESOLVE TICKET FORM */}
              {dialogMode === "resolve" && (
                <form onSubmit={handleResolveTicket} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-1.5 text-lg font-black text-zinc-900">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Resolve Ticket
                    </DialogTitle>
                    <DialogDescription>
                      Document the resolution details taken to address this ticket issue.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2 text-xs">
                    <div className="space-y-2 bg-muted/30 p-3 rounded-lg border">
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Complaint Detail</p>
                      <p className="font-semibold text-zinc-800 leading-tight">"{activeComplaint.description}"</p>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 uppercase tracking-wider text-[10px]">Action Resolution Notes</label>
                      <textarea
                        value={resolutionInput}
                        onChange={(e) => setResolutionInput(e.target.value)}
                        className="w-full p-2.5 rounded-lg border bg-muted/40 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 placeholder:text-zinc-400"
                        placeholder="e.g. Cleared and re-calibrated the gym treadmills..."
                        rows={3}
                        required
                      />
                    </div>
                  </div>

                  <DialogFooter className="border-t pt-3 flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !resolutionInput.trim()} 
                      className="font-bold text-xs bg-emerald-600 hover:bg-emerald-500"
                    >
                      {isSubmitting ? "Processing..." : "Complete Resolution"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      size="sm"
                      className="text-xs font-semibold"
                      onClick={() => {
                        setDialogMode("details");
                        setResolutionInput("");
                      }}
                    >
                      Back
                    </Button>
                  </DialogFooter>
                </form>
              )}

              {/* DELETE TICKET CONFIRMATION */}
              {dialogMode === "delete" && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-1.5 text-lg font-black text-red-600">
                      <Trash className="w-5 h-5 animate-bounce" /> Delete Ticket
                    </DialogTitle>
                    <DialogDescription>
                      Are you sure you want to permanently delete this member complaint ticket? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3 bg-red-50/50 p-4 rounded-xl border border-red-100 my-2 text-xs">
                    <p className="font-bold text-red-950">Ticket Details:</p>
                    <p className="text-red-900 leading-snug">Member: <span className="font-black">{activeComplaint.member.user.name}</span></p>
                    <p className="text-red-900 leading-snug mt-1">Issue: "{activeComplaint.description}"</p>
                  </div>

                  <DialogFooter className="border-t pt-3 flex gap-2">
                    <Button 
                      type="button" 
                      disabled={isSubmitting} 
                      className="font-bold text-xs bg-red-600 hover:bg-red-500"
                      onClick={handleDeleteTicket}
                    >
                      {isSubmitting ? "Deleting..." : "Permanently Delete"}
                    </Button>
                    <DialogClose render={<Button variant="secondary" size="sm" className="text-xs font-semibold" />} />
                  </DialogFooter>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
