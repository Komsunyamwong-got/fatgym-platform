"use server";

import db from "@/lib/db";

export async function getReportStats() {
  try {
    const totalRevenue = await db.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" }
    });

    const activeMembers = await db.member.count({
      where: { status: "ACTIVE" }
    });

    const leadsCount = await db.lead.count();
    
    // Simple monthly revenue for charts (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const payments = await db.payment.findMany({
      where: {
        status: "PAID",
        createdAt: { gte: sixMonthsAgo }
      },
      select: { amount: true, createdAt: true }
    });

    const monthlyRevenue = payments.reduce((acc: any, p) => {
      const month = p.createdAt.toLocaleString('en-US', { month: 'short' });
      acc[month] = (acc[month] || 0) + Number(p.amount);
      return acc;
    }, {});

    const salesData = Object.entries(monthlyRevenue).map(([month, sales]) => ({
      month,
      sales
    }));

    const memberStatusCounts = await db.member.groupBy({
      by: ['status'],
      _count: true
    });

    const memberData = memberStatusCounts.map(s => ({
      name: s.status,
      value: s._count,
      color: s.status === "ACTIVE" ? "#22c55e" : s.status === "EXPIRED" ? "#ef4444" : "#3b82f6"
    }));

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      activeMembers,
      leadsCount,
      salesData,
      memberData
    };
  } catch (error) {
    console.error("Failed to fetch report stats:", error);
    return null;
  }
}
