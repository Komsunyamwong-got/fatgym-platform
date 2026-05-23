import { PaymentsClient } from "@/components/payments/payments-client";
import { getPayments } from "@/app/actions/payments";

export default async function PaymentsPage() {
  const payments = await getPayments();

  return (
    <PaymentsClient initialPayments={payments} />
  );
}
