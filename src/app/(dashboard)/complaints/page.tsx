import { ComplaintsClient } from "@/components/complaints/complaints-client";
import { getComplaints } from "@/app/actions/complaints";

export default async function ComplaintsPage() {
  const complaints = await getComplaints();

  return (
    <ComplaintsClient initialComplaints={complaints} />
  );
}
