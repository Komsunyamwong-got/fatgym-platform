import db from "@/lib/db";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getReportStats } from "@/app/actions/reports";

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
  
  // Fetch real stats using the robust reports aggregator
  const stats = await getReportStats("all");

  return (
    <DashboardClient 
      memberCount={memberCount}
      pendingSessions={pendingSessions}
      lowStockItems={lowStockItems}
      openComplaints={openComplaints}
      totalRevenue={stats?.totalRevenue || 0}
      leadsCount={stats?.leadsCount || 0}
      salesData={stats?.salesData || []}
    />
  );
}
