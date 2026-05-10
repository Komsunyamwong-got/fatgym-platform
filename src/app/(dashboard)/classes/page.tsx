import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Users, 
  MoreVertical,
  Dumbbell,
  Check
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { ClassForm } from "@/components/classes/class-form";
import { cn } from "@/lib/utils";
import { getClasses } from "@/app/actions/classes";

export default async function ClassesPage() {
  const classes = await getClasses();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Group Classes</h2>
          <p className="text-muted-foreground text-sm">Schedule and manage gym group sessions.</p>
        </div>
        <Dialog>
          <DialogTrigger
            render={
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Create Class
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
            </DialogHeader>
            <ClassForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl shadow-sm border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-10 bg-muted/50 border-none" placeholder="Search classes..." />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none">Today</Button>
          <Button variant="outline" className="flex-1 md:flex-none">Calendar View</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length === 0 && (
          <div className="col-span-full py-20 text-center bg-muted/20 rounded-2xl border-2 border-dashed">
            <p className="text-muted-foreground">No classes scheduled. Create your first class!</p>
          </div>
        )}
        {classes.map((cls: any) => (
          <Card key={cls.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                  {cls.category || "Fitness"}
                </Badge>
              </div>
              <div className="pt-4">
                <CardTitle className="text-xl group-hover:text-primary transition-colors">{cls.name}</CardTitle>
                <CardDescription className="line-clamp-1">{cls.description || "No description provided."}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(cls.startTime).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {cls._count?.bookings || 0} / {cls.capacity} Booked
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={cls.trainer.user.image || ""} />
                    <AvatarFallback className="text-[10px] bg-muted">
                      {cls.trainer.user.name.split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">Coach {cls.trainer.user.name.split(" ")[1] || cls.trainer.user.name}</span>
                </div>
                <Button size="sm" variant="ghost" className="gap-2">
                  Edit <MoreVertical className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
