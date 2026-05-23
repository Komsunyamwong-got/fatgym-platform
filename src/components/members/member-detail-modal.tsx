"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export function MemberDetailModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  return (
    <Dialog open onOpenChange={(isOpen) => {
      if (!isOpen) {
        router.back();
      }
    }}>
      <DialogContent className="sm:max-w-5xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <DialogTitle className="sr-only">Member Details</DialogTitle>
        <DialogDescription className="sr-only">Detailed view of a member</DialogDescription>
        <div className="mt-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
