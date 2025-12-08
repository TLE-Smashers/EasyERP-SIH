'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, CreditCard, CheckCircle2, XCircle } from 'lucide-react';
import type { Payment } from '@/types/payment';

interface PaymentStatsClientProps {
  payments: Payment[];
}

export function PaymentStatsClient({ payments }: PaymentStatsClientProps) {

  // Calculate stats
  const totalPayments = payments.length;
  const paidPayments = payments.filter((p) => p.paymentStatus === 'paid');
  const unpaidPayments = payments.filter((p) => p.paymentStatus === 'unpaid');
  
  const totalAmount = payments.reduce((sum, p) => sum + p.totalAmount, 0);
  const paidAmount = paidPayments.reduce((sum, p) => sum + p.totalAmount, 0);
  const unpaidAmount = unpaidPayments.reduce((sum, p) => sum + p.totalAmount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      title: 'Total Collected',
      value: formatCurrency(paidAmount),
      count: `${paidPayments.length} payments`,
      icon: IndianRupee,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Pending Payments',
      value: formatCurrency(unpaidAmount),
      count: `${unpaidPayments.length} payments`,
      icon: CreditCard,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      title: 'Success Rate',
      value: `${totalPayments > 0 ? Math.round((paidPayments.length / totalPayments) * 100) : 0}%`,
      count: `${paidPayments.length} of ${totalPayments}`,
      icon: CheckCircle2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(totalAmount),
      count: `${totalPayments} total`,
      icon: IndianRupee,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.count}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
