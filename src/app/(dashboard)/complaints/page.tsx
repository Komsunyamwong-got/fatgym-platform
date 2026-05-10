import { Button } from "@/components/ui/button";
import { 
  Plus, 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { ComplaintForm } from "@/components/complaints/complaint-form";
import { getComplaints } from "@/app/actions/complaints";
import { ComplaintsContent } from "@/components/complaints/complaints-content";

export default async function ComplaintsPage() {
  const complaints = await getComplaints();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Member Complaints</h2>
          <p className="text-muted-foreground text-sm">Manage and resolve member feedback and issues.</p>
        </div>
        <Dialog>
          <DialogTrigger
            render={
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> New Ticket
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Complaint</DialogTitle>
            </DialogHeader>
            <ComplaintForm />
          </DialogContent>
        </Dialog>
      </div>

      <ComplaintsContent initialComplaints={complaints} />
    </div>
  );
}
