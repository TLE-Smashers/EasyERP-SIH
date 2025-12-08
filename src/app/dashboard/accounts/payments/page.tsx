import { Suspense } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { PaymentStatsClient } from '@/components/payment/PaymentStats';
import { PaymentListClient } from '@/components/payment/PaymentList';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchPaymentsAction } from '@/actions/payment/paymentActions';

export default async function PaymentsPage() {
  // Fetch payments server-side
  const result = await fetchPaymentsAction();
  const payments = result.success ? result.payments : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payments"
        description="Manage admission fees, semester fees, and other payments"
      />

      {/* Stats Cards */}
      <PaymentStatsClient payments={payments} />

      {/* Payments Table */}
      <PaymentListClient initialPayments={payments} />
    </div>
  );
}
