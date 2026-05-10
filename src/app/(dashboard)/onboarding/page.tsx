import OnboardingWizard from "@/components/onboarding/onboarding-wizard";
import db from "@/lib/db";
import { redirect } from "next/navigation";

export default async function OnboardingPage({ searchParams }: { searchParams: { memberId?: string } }) {
  let memberId = searchParams.memberId;

  // If no memberId, pick the first one without onboarding for demo purposes
  if (!memberId) {
    const member = await db.member.findFirst({
      where: { healthScreening: null }
    });
    memberId = member?.id;
  }

  if (!memberId) {
    // If absolutely no members, redirect to member creation
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h2 className="text-xl font-bold">No members found for onboarding</h2>
        <p className="text-muted-foreground">Please create a member first.</p>
      </div>
    );
  }

  return <OnboardingWizard memberId={memberId} />;
}
