'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, Download, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreatePaymentSheet } from '@/components/payment/CreatePaymentSheet';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { fetchPaymentsAction } from '@/actions/payment/paymentActions';
import type { Payment } from '@/types/payment';

interface FeeCollectionClientProps {
  initialPayments: Payment[];
}

export function FeeCollectionClient({ initialPayments }: FeeCollectionClientProps) {
  'use no memo';
  const { data: session } = useSession();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [payments, setPayments] = React.useState<Payment[]>(initialPayments);
  const [paymentTypeFilter, setPaymentTypeFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [showPaymentSheet, setShowPaymentSheet] = React.useState(false);

  // Load payments
  const loadPayments = React.useCallback(async () => {
    try {
      const result = await fetchPaymentsAction();
      if (result.success) {
        setPayments(result.payments);
      } else {
        toast.error('Failed to load payments');
      }
    } catch {
      toast.error('Error loading payments');
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>;
      case 'unpaid':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Unpaid</Badge>;
      case 'partial':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Partial</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'referenceNumber',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Reference No
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('referenceNumber')}</div>
      ),
    },
    {
      accessorKey: 'studentInfo.studentName',
      header: 'Student Name',
      cell: ({ row }) => {
        const name = row.original.studentInfo.studentName;
        return <div>{name}</div>;
      },
    },
    {
      accessorKey: 'studentInfo.course',
      header: 'Course',
      cell: ({ row }) => {
        const course = row.original.studentInfo.course;
        const branch = row.original.studentInfo.branch;
        return <div className="text-sm">{course} - {branch}</div>;
      },
    },
    {
      accessorKey: 'paymentType',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Payment Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const type = row.getValue('paymentType') as string;
        return (
          <Badge variant="outline" className="capitalize">
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = row.getValue('totalAmount') as number;
        return <div className="font-semibold">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('paymentStatus') as string;
        return getStatusBadge(status);
      },
    },
    {
      accessorKey: 'paymentDate',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Payment Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue('paymentDate') as string | undefined;
        return <div className="text-sm">{formatDate(date)}</div>;
      },
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Method',
      cell: ({ row }) => {
        const method = row.getValue('paymentMethod') as string;
        return (
          <Badge variant="secondary" className="capitalize">
            {method}
          </Badge>
        );
      },
    },
  ];

  // Filter payments based on selected filters
  const filteredPayments = React.useMemo(() => {
    return payments.filter((payment) => {
      const matchesType = paymentTypeFilter === 'all' || payment.paymentType === paymentTypeFilter;
      const matchesStatus = statusFilter === 'all' || payment.paymentStatus === statusFilter;
      return matchesType && matchesStatus;
    });
  }, [payments, paymentTypeFilter, statusFilter]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = filteredPayments.reduce((sum, p) => sum + p.totalAmount, 0);
    const collected = filteredPayments
      .filter((p) => p.paymentStatus === 'paid')
      .reduce((sum, p) => sum + p.totalAmount, 0);
    const pending = filteredPayments
      .filter((p) => p.paymentStatus === 'unpaid')
      .reduce((sum, p) => sum + p.totalAmount, 0);
    const count = filteredPayments.length;
    const paidCount = filteredPayments.filter((p) => p.paymentStatus === 'paid').length;

    return { total, collected, pending, count, paidCount };
  }, [filteredPayments]);

  const table = useReactTable({
    data: filteredPayments,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
  });

  const exportToCSV = () => {
    const headers = ['Reference No', 'Student Name', 'Course', 'Payment Type', 'Amount', 'Status', 'Payment Date', 'Method'];
    const rows = filteredPayments.map((p) => [
      p.referenceNumber,
      p.studentInfo.studentName,
      `${p.studentInfo.course} - ${p.studentInfo.branch}`,
      p.paymentType,
      p.totalAmount,
      p.paymentStatus,
      formatDate(p.paymentDate),
      p.paymentMethod,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee-collection-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Fees</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(stats.total)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{stats.count} payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Collected</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {formatCurrency(stats.collected)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{stats.paidCount} paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">
              {formatCurrency(stats.pending)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.count - stats.paidCount} unpaid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Collection Rate</CardDescription>
            <CardTitle className="text-2xl">
              {stats.total > 0 ? ((stats.collected / stats.total) * 100).toFixed(1) : 0}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">of total fees</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Fee Collection Records</CardTitle>
              <CardDescription>View and manage all payment records</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={() => setShowPaymentSheet(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create Payment
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search by student name..."
                value={(table.getColumn('studentInfo.studentName')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn('studentInfo.studentName')?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />

              <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Payment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="admission">Admission</SelectItem>
                  <SelectItem value="semester">Semester</SelectItem>
                  <SelectItem value="hostel">Hostel</SelectItem>
                  <SelectItem value="library">Library</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {table.getRowModel().rows.length} of {filteredPayments.length} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Payment Dialog */}
      <CreatePaymentSheet
        open={showPaymentSheet}
        onOpenChange={setShowPaymentSheet}
        createdBy={session?.user?.email || 'system'}
        onSuccess={() => {
          loadPayments();
          toast.success('Payment created successfully');
        }}
      />
    </div>
  );
}
