import { Suspense } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { FeeCollectionClient } from '@/components/accounts/FeeCollectionClient';
import { fetchPaymentsAction } from '@/actions/payment/paymentActions';

export default async function FeeCollectionPage() {
  // Fetch payments from Payment sheet
  const result = await fetchPaymentsAction();
  const payments = result.success ? result.payments : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fee Collection"
        description="Track and manage fee collection across all students"
      />

      <FeeCollectionClient initialPayments={payments} />
    </div>
  );
}
