import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Filter,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { PTSessionForm } from "@/components/pt-sessions/pt-session-form";
import { getPTSessions } from "@/app/actions/pt-sessions";
import { PTSessionsTable } from "@/components/pt-sessions/pt-sessions-table";

export default async function PTSessionsPage() {
  const sessions = await getPTSessions();
  const todayCount = sessions.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length;
  const pendingCount = sessions.filter(s => s.status === "PENDING_CONFIRMATION").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">PT Sessions</h2>
          <p className="text-muted-foreground text-sm">Schedule and track private training sessions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <CalendarIcon className="w-4 h-4" /> Calendar View
          </Button>
          <Dialog>
            <DialogTrigger
              render={
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> Book Session
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book PT Session</DialogTitle>
              </DialogHeader>
              <PTSessionForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Today's Sessions</p>
              <p className="text-2xl font-bold">{todayCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completed (Mo)</p>
              <p className="text-2xl font-bold">{sessions.filter(s => s.status === "COMPLETED").length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl shadow-sm border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-10 bg-muted/50 border-none" placeholder="Search by member or trainer..." />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
          <Button variant="outline" className="flex-1 md:flex-none">History</Button>
        </div>
      </div>

      <PTSessionsTable sessions={sessions} />
    </div>
  );
}
