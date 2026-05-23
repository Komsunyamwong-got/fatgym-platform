import { getPTSessions } from "@/app/actions/pt-sessions";
import { PTSessionsClient } from "@/components/pt-sessions/pt-sessions-client";

export default async function PTSessionsPage() {
  const sessions = await getPTSessions();

  return (
    <PTSessionsClient initialSessions={sessions} />
  );
}
