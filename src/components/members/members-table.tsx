"use client";

import { useState } from "react";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { MoreHorizontal, Plus, Search, Filter, User as UserIcon, Calendar, CreditCard, Trash, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { deleteMember, recordAttendance, extendMembership } from "@/app/actions/members";

export function MembersTable({ members }: { members: any[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  
  // State for modals
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [extendTarget, setExtendTarget] = useState<any | null>(null);
  const [extendMonths, setExtendMonths] = useState<number>(1);

  const handleAttendance = async (id: string) => {
    toast.promise(recordAttendance(id), {
      loading: "Recording attendance...",
      success: (data) => {
        if (data.success) return "Attendance recorded successfully";
        throw new Error(data.error);
      },
      error: "Failed to record attendance"
    });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await deleteMember(deleteTarget.id);
    if (res.success) {
      toast.success("Member removed successfully");
      setDeleteTarget(null);
    } else {
      toast.error(res.error || "Failed to remove member");
    }
    setIsDeleting(false);
  };

  const executeExtend = async () => {
    if (!extendTarget) return;
    setIsExtending(true);
    const res = await extendMembership(extendTarget.id, extendMonths);
    if (res.success) {
      toast.success(`Membership extended by ${extendMonths} month(s)`);
      setExtendTarget(null);
    } else {
      toast.error(res.error || "Failed to extend membership");
    }
    setIsExtending(false);
  };

  const filteredMembers = members.filter((member) => {
    const searchStr = searchQuery.toLowerCase();
    const name = member?.user?.name || "";
    const memberId = member?.memberId || "";
    const phone = member?.phone || "";
    
    const matchesSearch = name.toLowerCase().includes(searchStr) ||
                          memberId.toLowerCase().includes(searchStr) ||
                          phone.toLowerCase().includes(searchStr);
    const matchesStatus = statusFilter === "ALL" || member.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const headers = ["Member ID", "Name", "Phone", "Status", "Expiry Date"];
    const csvData = filteredMembers.map(m => [
      m.memberId,
      `"${m?.user?.name || ""}"`,
      m.phone || "N/A",
      m.status,
      m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : "N/A"
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `members_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl shadow-sm border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10 bg-muted/50 border-none" 
            placeholder="Search members by name or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none min-w-[120px]">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground" /> 
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={cn(buttonVariants({ variant: "outline" }), "w-full pl-9 pr-4 cursor-pointer appearance-none bg-transparent")}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
          <Button variant="outline" className="flex-1 md:flex-none" onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      <ResponsiveDataTable
        data={filteredMembers}
        columns={[
          {
            header: "Member Name",
            accessorKey: "memberId",
            cell: (member: any) => (
              <div className="flex flex-col">
                <span className="font-bold">{member.user.name}</span>
                <span className="text-xs text-muted-foreground text-[10px]">{member.memberId}</span>
              </div>
            ),
          },
          {
            header: "Phone",
            accessorKey: "phone",
          },
          {
            header: "Status",
            accessorKey: "status",
            cell: (member: any) => (
              <Badge 
                className={cn(
                  "border-none font-bold text-[10px]",
                  member.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}
              >
                {member.status}
              </Badge>
            ),
          },
          {
            header: "Expiry Date",
            accessorKey: "expiryDate",
            cell: (member: any) => member.expiryDate ? new Date(member.expiryDate).toLocaleDateString() : "N/A",
          },
          {
            header: "",
            accessorKey: "id",
            cell: (member: any) => (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link 
                      href={`/members/${member.id}`} 
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <UserIcon className="w-4 h-4 mr-2" /> View Detail
                    </Link>
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => handleAttendance(member.id)}>
                      <Check className="w-4 h-4" /> Log Attendance
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => setExtendTarget(member)}>
                      <CreditCard className="w-4 h-4" /> Extend Plan
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive flex items-center gap-2 cursor-pointer" onClick={() => setDeleteTarget(member)}>
                    <Trash className="w-4 h-4" /> Remove Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
        mobileRender={(member: any) => (
          <div className="p-4 space-y-4 border-b last:border-0">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold">{member.user.name}</h4>
                <p className="text-xs text-muted-foreground">ID: {member.memberId}</p>
              </div>
              <Badge 
                className={cn(
                  "border-none font-bold text-[10px]",
                  member.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}
              >
                {member.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-y">
              <span className="text-xs text-muted-foreground">Phone: <span className="font-bold text-foreground">{member.phone}</span></span>
              <span className="text-xs text-muted-foreground">Expiry: <span className="font-bold text-foreground">{member.expiryDate ? new Date(member.expiryDate).toLocaleDateString() : "N/A"}</span></span>
            </div>
            <div className="flex gap-2">
              <Button 
                className="flex-1 h-9" 
                variant="outline" 
                render={
                  <Link href={`/members/${member.id}`}>View Detail</Link>
                }
              />
              <Button className="flex-1 h-9" onClick={() => setExtendTarget(member)}>Extend</Button>
            </div>
          </div>
        )}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to remove <strong>{deleteTarget?.user?.name}</strong>? 
              This action cannot be undone and will delete all associated data.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={executeDelete} disabled={isDeleting}>
              {isDeleting ? "Removing..." : "Remove"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Extend Plan Modal */}
      <Dialog open={!!extendTarget} onOpenChange={(open) => !open && setExtendTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Extend Membership Plan</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold">{extendTarget?.user?.name}</p>
                <p className="text-xs text-muted-foreground">Current Expiry: {extendTarget?.expiryDate ? new Date(extendTarget.expiryDate).toLocaleDateString() : "None"}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-medium">Select Duration</p>
              <div className="grid grid-cols-2 gap-2">
                {[1, 3, 6, 12].map(months => (
                  <Button 
                    key={months} 
                    variant={extendMonths === months ? "default" : "outline"} 
                    className="w-full justify-start"
                    onClick={() => setExtendMonths(months)}
                  >
                    {months} Month{months > 1 ? 's' : ''}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setExtendTarget(null)} disabled={isExtending}>Cancel</Button>
            <Button onClick={executeExtend} disabled={isExtending}>
              {isExtending ? "Processing..." : "Confirm Extension"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
