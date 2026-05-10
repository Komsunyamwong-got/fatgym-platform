import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import db from "@/lib/db";
import { TrainersList } from "@/components/trainers/trainers-list";

export default async function TrainersPage() {
  const trainers = await db.trainer.findMany({
    include: {
      user: true,
      _count: {
        select: { ptSessions: true, clients: true }
      }
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Coaching Staff</h2>
          <p className="text-muted-foreground text-sm">Manage your personal trainers and performance.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Trainer
        </Button>
      </div>

      <TrainersList trainers={trainers} />
    </div>
  );
}
