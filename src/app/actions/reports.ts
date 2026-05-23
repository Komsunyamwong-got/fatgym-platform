"use server";

import db from "@/lib/db";

export async function getReportStats(range: string = "all") {
  try {
    // 1. Calculate startDateFilter based on range parameter
    let startDateFilter = new Date(0); // Default to all-time
    const now = new Date();
    if (range === "30d") {
      startDateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === "90d") {
      startDateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (range === "180d") {
      startDateFilter = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    }

    // 2. Fetch Total Revenue
    const totalRevenueResult = await db.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "PAID",
        createdAt: { gte: startDateFilter }
      }
    });
    const totalRevenue = totalRevenueResult._sum.amount || 0;

    // 3. Fetch Active Members
    const activeMembers = await db.member.count({
      where: { status: "ACTIVE" }
    });

    // 4. Fetch Total Leads count
    const leadsCount = await db.lead.count();

    // 5. Calculate dynamic Average Visits per member based on check-ins, PT sessions, and class bookings
    const checkinsCount = await db.checkIn.count({
      where: { createdAt: { gte: startDateFilter } }
    });
    const bookingsCount = await db.classBooking.count({
      where: { createdAt: { gte: startDateFilter } }
    });
    const ptSessionsCount = await db.pTSession.count({
      where: { date: { gte: startDateFilter } }
    });
    const totalVisits = checkinsCount + bookingsCount + ptSessionsCount;
    const uniqueMembersCount = await db.member.count();
    const avgVisit = uniqueMembersCount > 0 
      ? (totalVisits / uniqueMembersCount).toFixed(1) 
      : "0.0";

    // 6. Chronological Monthly Revenue Breakdown for AreaChart
    const payments = await db.payment.findMany({
      where: {
        status: "PAID",
        createdAt: { gte: startDateFilter }
      },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: "asc" }
    });

    const monthlyRevenueMap = new Map<string, number>();
    payments.forEach(p => {
      const key = p.createdAt.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      monthlyRevenueMap.set(key, (monthlyRevenueMap.get(key) || 0) + Number(p.amount));
    });

    const salesData = Array.from(monthlyRevenueMap.entries()).map(([month, sales]) => ({
      month,
      sales
    }));

    // 7. Member Split status distribution
    const memberStatusCounts = await db.member.groupBy({
      by: ['status'],
      _count: true
    });

    const memberData = memberStatusCounts.map(s => ({
      name: s.status,
      value: s._count,
      color: s.status === "ACTIVE" ? "#22c55e" : 
             s.status === "EXPIRED" ? "#ef4444" : 
             s.status === "CANCELLED" ? "#64748b" : "#3b82f6"
    }));

    // 8. Top Selling Categories (Membership package price, PT package price, Inventory transaction category revenue OUT)
    const membershipSumResult = await db.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "PAID",
        createdAt: { gte: startDateFilter },
        purchase: { membershipPackageId: { not: null } }
      }
    });
    const membershipRevenue = membershipSumResult._sum.amount || 0;

    const ptSumResult = await db.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "PAID",
        createdAt: { gte: startDateFilter },
        purchase: { ptPackageId: { not: null } }
      }
    });
    const ptRevenue = ptSumResult._sum.amount || 0;

    const inventoryTransactions = await db.inventoryTransaction.findMany({
      where: {
        type: "OUT",
        createdAt: { gte: startDateFilter }
      },
      include: { item: true }
    });

    const inventoryCategoryMap = new Map<string, number>();
    inventoryTransactions.forEach(t => {
      const cat = t.item.category || "Other";
      const rev = Number(t.quantity) * (t.item.sellingPrice || 0);
      inventoryCategoryMap.set(cat, (inventoryCategoryMap.get(cat) || 0) + rev);
    });

    const categoryData = [
      { name: "Memberships", rev: membershipRevenue },
      { name: "Personal Training", rev: ptRevenue },
      ...Array.from(inventoryCategoryMap.entries()).map(([name, rev]) => ({ name, rev }))
    ].sort((a, b) => b.rev - a.rev); // Sort descending

    // 9. Peak Training Hours (PT sessions and class bookings grouped by hour)
    const ptSessionsAll = await db.pTSession.findMany({
      where: { date: { gte: startDateFilter } },
      select: { date: true }
    });

    const classBookingsAll = await db.classBooking.findMany({
      where: { createdAt: { gte: startDateFilter } },
      include: { class: true }
    });

    const hourCounts = new Array(24).fill(0);
    ptSessionsAll.forEach(s => {
      const h = new Date(s.date).getHours();
      if (h >= 0 && h < 24) hourCounts[h]++;
    });
    classBookingsAll.forEach(b => {
      const h = new Date(b.class.startTime).getHours();
      if (h >= 0 && h < 24) hourCounts[h]++;
    });

    // Map standard hours (8 AM to 8 PM)
    const peakHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(h => ({
      hour: h,
      count: hourCounts[h] || 0
    }));

    // Find the max booking count in our peak hours to display percentages
    const maxHourCount = Math.max(1, ...peakHours.map(p => p.count));
    const peakHoursData = peakHours.map(p => ({
      hour: p.hour,
      count: p.count,
      percentage: Math.round((p.count / maxHourCount) * 100)
    }));

    // 10. Fetch detailed payments payload for direct CSV downloads
    const paymentDetails = await db.payment.findMany({
      where: {
        status: "PAID",
        createdAt: { gte: startDateFilter }
      },
      include: {
        purchase: {
          include: {
            member: {
              include: { user: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return {
      totalRevenue,
      activeMembers,
      leadsCount,
      avgVisit,
      salesData,
      memberData,
      categoryData,
      peakHoursData,
      paymentDetails
    };
  } catch (error) {
    console.error("Failed to fetch report stats:", error);
    return null;
  }
}
