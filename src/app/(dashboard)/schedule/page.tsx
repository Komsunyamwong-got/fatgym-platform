import db from "@/lib/db";
import { ScheduleView } from "@/components/schedule/schedule-view";

export default async function SchedulePage() {
  const sessions = await db.pTSession.findMany({
    include: {
      member: { include: { user: true } },
      trainer: { include: { user: true } }
    },
    orderBy: { startTime: "asc" }
  });

  const trainers = await db.trainer.findMany({
    include: { user: true }
  });

  return (
    <div className="animate-in fade-in duration-500">
      <ScheduleView sessions={sessions} trainers={trainers} />
    </div>
  );
}
