import { Suspense } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { PaymentPeriodsClient } from '@/components/accounts/PaymentPeriodsClient';
import { fetchAllPeriodsAction } from '@/actions/paymentPeriod/paymentPeriodActions';

export default async function PaymentPeriodsPage() {
  // Fetch all payment periods
  const result = await fetchAllPeriodsAction();
  const periods = result.success ? result.periods : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payment Periods"
        description="Manage when students can pay semester fees, hostel fees, and other payments"
      />

      <PaymentPeriodsClient initialPeriods={periods || []} />
    </div>
  );
}
