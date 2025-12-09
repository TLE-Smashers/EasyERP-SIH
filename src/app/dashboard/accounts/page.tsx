import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, DollarSign, FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { fetchPaymentsAction } from '@/actions/payment/paymentActions';

export default async function AccountsDashboard() {
  // Fetch payments for stats
  const result = await fetchPaymentsAction();
  const payments = result.success ? result.payments : [];

  // Calculate stats
  const totalRevenue = payments
    .filter(p => p.paymentStatus === 'paid')
    .reduce((sum, p) => sum + p.totalAmount, 0);
  
  const pendingPayments = payments.filter(p => p.paymentStatus === 'unpaid').length;
  const completedPayments = payments.filter(p => p.paymentStatus === 'paid').length;
  const failedPayments = payments.filter(p => p.paymentStatus === 'failed').length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Accounts Dashboard"
        description="Manage fees, payments, and financial records"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {completedPayments} completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPayments}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedPayments}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/accounts/payments">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                View All Payments
              </CardTitle>
              <CardDescription>
                Manage admission fees, semester fees, and other payments
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/accounts/fees">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fee Collection
              </CardTitle>
              <CardDescription>
                Track and manage fee collection across branches
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/accounts/receipts">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Receipts
              </CardTitle>
              <CardDescription>
                Generate and download payment receipts
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{payment.studentInfo.studentName}</p>
                  <p className="text-xs text-muted-foreground">
                    {payment.paymentType} • {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'Pending'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">₹{payment.totalAmount.toLocaleString()}</p>
                  <p className={`text-xs ${
                    payment.paymentStatus === 'paid' ? 'text-green-600' : 
                    payment.paymentStatus === 'unpaid' ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {payment.paymentStatus}
                  </p>
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No payments found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
