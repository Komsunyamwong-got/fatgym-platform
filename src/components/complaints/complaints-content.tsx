"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ComplaintsTable } from "@/components/complaints/complaints-table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ComplaintsContentProps {
  initialComplaints: any[];
}

export function ComplaintsContent({ initialComplaints }: ComplaintsContentProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [complaints, setComplaints] = React.useState(initialComplaints);

  const filteredComplaints = React.useMemo(() => {
    return initialComplaints.filter(c => {
      const searchStr = searchQuery.toLowerCase();
      return (
        c.member.user.name.toLowerCase().includes(searchStr) ||
        c.type.toLowerCase().includes(searchStr) ||
        c.description.toLowerCase().includes(searchStr) ||
        c.member.memberId.toLowerCase().includes(searchStr)
      );
    });
  }, [searchQuery, initialComplaints]);

  const openCount = initialComplaints.filter(c => c.status === "OPEN").length;
  const inProgressCount = initialComplaints.filter(c => c.status === "IN_PROGRESS").length;
  const resolvedCount = initialComplaints.filter(c => c.status === "RESOLVED").length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-red-50/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Open</p>
              <p className="text-2xl font-bold">{openCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-blue-50/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">In Progress</p>
              <p className="text-2xl font-bold">{inProgressCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-green-50/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Resolved</p>
              <p className="text-2xl font-bold">{resolvedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl shadow-sm border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary" 
            placeholder="Search by member, ID or content..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none gap-2" onClick={() => toast.info("Advanced filters are being integrated.")}>
            <Filter className="w-4 h-4" /> Filters
          </Button>
          <Button variant="outline" className="flex-1 md:flex-none" onClick={() => toast.info("Archive module will be available in the next update.")}>Archives</Button>
        </div>
      </div>

      {filteredComplaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
          <Search className="w-10 h-10 text-muted-foreground mb-4 opacity-20" />
          <p className="text-muted-foreground font-medium">No complaints found matching "{searchQuery}"</p>
        </div>
      ) : (
        <ComplaintsTable complaints={filteredComplaints} />
      )}
    </div>
  );
}
