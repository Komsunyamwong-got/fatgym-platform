import { LeadsClient } from "@/components/leads/leads-client";
import { getLeads } from "@/app/actions/leads";

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <LeadsClient initialLeads={leads} />
  );
}
