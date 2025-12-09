import { Suspense } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { ReceiptsClient } from '@/components/accounts/ReceiptsClient';
import { fetchPaymentsAction } from '@/actions/payment/paymentActions';

export default async function ReceiptsPage() {
  // Fetch paid payments for receipt generation
  const result = await fetchPaymentsAction();
  const payments = result.success ? result.payments : [];
  const paidPayments = payments.filter(p => p.paymentStatus === 'paid');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payment Receipts"
        description="Generate and print payment receipts"
      />

      <ReceiptsClient initialPayments={paidPayments} />
    </div>
  );
}
