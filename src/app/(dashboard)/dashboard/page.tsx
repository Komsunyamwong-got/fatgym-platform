import db from "@/lib/db";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  // Real data fetching
  const memberCount = await db.member.count({ where: { status: "ACTIVE" } });
  const pendingSessions = await db.pTSession.count({ where: { status: "PENDING_CONFIRMATION" } });
  const lowStockItems = await db.inventoryItem.count({
    where: {
      quantity: {
        lte: db.inventoryItem.fields.minStock
      }
    }
  });
  const openComplaints = await db.complaint.count({ where: { status: "OPEN" } });

  return (
    <DashboardClient 
      memberCount={memberCount}
      pendingSessions={pendingSessions}
      lowStockItems={lowStockItems}
      openComplaints={openComplaints}
    />
  );
}
