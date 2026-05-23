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
      <TrainersList trainers={trainers} />
    </div>
  );
}
