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
import { ArrowUpDown, Eye, MoreHorizontal, Plus, Download } from 'lucide-react';

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CreatePaymentSheet } from './CreatePaymentSheet';
import { PaymentReceiptDialog } from './PaymentReceiptDialog';
import { fetchPaymentsAction } from '@/actions/payment/paymentActions';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import type { Payment } from '@/types/payment';

interface PaymentListClientProps {
  initialPayments: Payment[];
}

export function PaymentListClient({ initialPayments }: PaymentListClientProps) {
  const { data: session } = useSession();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [payments, setPayments] = React.useState<Payment[]>(initialPayments);
  const [loading, setLoading] = React.useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = React.useState(false);
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = React.useState(false);

  // Load payments
  const loadPayments = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchPaymentsAction();
      if (result.success) {
        setPayments(result.payments);
      } else {
        toast.error('Failed to load payments');
      }
    } catch (error) {
      toast.error('Error loading payments');
    } finally {
      setLoading(false);
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Payment ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="font-mono text-xs">{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'studentInfo',
      header: 'Student',
      cell: ({ row }) => {
        const studentInfo = row.getValue('studentInfo') as Payment['studentInfo'];
        return (
          <div>
            <div className="font-medium">{studentInfo.studentName}</div>
            <div className="text-xs text-muted-foreground">{studentInfo.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'paymentType',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('paymentType') as string;
        return (
          <Badge variant="outline" className="capitalize">
            {type}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'totalAmount',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => formatCurrency(row.getValue('totalAmount')),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Method',
      cell: ({ row }) => {
        const method = row.getValue('paymentMethod') as string;
        return (
          <span className="capitalize">{method.replace('_', ' ')}</span>
        );
      },
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('paymentStatus') as string;
        const colors = {
          paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
          unpaid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
          partial: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
          failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
          refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
        };
        return (
          <Badge className={colors[status as keyof typeof colors]}>
            {status.toUpperCase()}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'createdDate',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => formatDate(row.getValue('createdDate')),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const payment = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPayment(payment);
                  setShowReceiptDialog(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Receipt
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(payment.id)}
              >
                Copy Payment ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(payment.studentInfo.email)}
              >
                Copy Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: payments,
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

  return (
    <>
      <Card className="p-6">
        {/* Filters and Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            <Input
              placeholder="Search by student name or email..."
              value={(table.getColumn('studentInfo')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('studentInfo')?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <Select
              value={(table.getColumn('paymentStatus')?.getFilterValue() as string) ?? 'all'}
              onValueChange={(value) =>
                table.getColumn('paymentStatus')?.setFilterValue(value === 'all' ? '' : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={(table.getColumn('paymentType')?.getFilterValue() as string) ?? 'all'}
              onValueChange={(value) =>
                table.getColumn('paymentType')?.setFilterValue(value === 'all' ? '' : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="admission">Admission</SelectItem>
                <SelectItem value="semester">Semester</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="hostel">Hostel</SelectItem>
                <SelectItem value="library">Library</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setShowPaymentSheet(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Payment
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Loading payments...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
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
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No payments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} payment(s) found
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
      </Card>

      {/* Dialogs */}
      <CreatePaymentSheet
        open={showPaymentSheet}
        onOpenChange={setShowPaymentSheet}
        createdBy={session?.user?.email || 'system'}
        onSuccess={() => {
          loadPayments();
          toast.success('Payment created successfully');
        }}
      />

      <PaymentReceiptDialog
        open={showReceiptDialog}
        onOpenChange={setShowReceiptDialog}
        payment={selectedPayment}
      />
    </>
  );
}
