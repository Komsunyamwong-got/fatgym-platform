import { MemberProfileView } from "@/components/members/member-profile-view";
import { MemberDetailModal } from "@/components/members/member-detail-modal";
import db from "@/lib/db";
import { notFound } from "next/navigation";

export default async function MemberDetailInterceptingRoute({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const member = await db.member.findUnique({
    where: { id },
    include: {
      user: true,
      ptSessions: {
        include: { trainer: { include: { user: true } } },
        orderBy: { date: "desc" },
        take: 5
      },
      measurements: {
        orderBy: { date: "desc" },
        take: 10
      },
      checkIns: {
        orderBy: { createdAt: "desc" },
        take: 5
      },
      goals: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!member) return notFound();

  return (
    <MemberDetailModal>
      <MemberProfileView member={member} />
    </MemberDetailModal>
  );
}
