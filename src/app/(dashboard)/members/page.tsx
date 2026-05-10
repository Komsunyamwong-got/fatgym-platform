import { Button, buttonVariants } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { MemberForm } from "@/components/members/member-form";
import { getMembers } from "@/app/actions/members";
import { MembersTable } from "@/components/members/members-table";

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Members</h2>
          <p className="text-muted-foreground text-sm">View and manage your gym members and their status.</p>
        </div>
        <Dialog>
          <DialogTrigger
            className={cn(buttonVariants({ variant: "default" }), "gap-2 px-4")}
          >
            <Plus className="w-4 h-4" /> Add Member
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
            </DialogHeader>
            <MemberForm />
          </DialogContent>
        </Dialog>
      </div>

      <MembersTable members={members} />
    </div>
  );
}
