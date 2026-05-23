import { getReportStats } from "@/app/actions/reports";
import { ReportsClient } from "@/components/reports/reports-client";

interface ReportsPageProps {
  searchParams: {
    range?: string;
  };
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const range = searchParams.range || "all";
  const stats = await getReportStats(range);

  if (!stats) {
    return (
      <div className="p-8 text-center text-zinc-500 font-semibold border rounded-xl bg-card">
        Error loading business reports dashboard
      </div>
    );
  }

  return (
    <ReportsClient stats={stats} />
  );
}
