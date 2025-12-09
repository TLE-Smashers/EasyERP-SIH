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
import { ArrowUpDown, Eye, Printer } from 'lucide-react';

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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PaymentReceipt } from '@/components/payment/PaymentReceipt';
import type { Payment } from '@/types/payment';

interface ReceiptsClientProps {
  initialPayments: Payment[];
}

export function ReceiptsClient({ initialPayments }: ReceiptsClientProps) {
  'use no memo';
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [payments] = React.useState<Payment[]>(initialPayments);
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = React.useState(false);

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

  const handleViewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowReceiptDialog(true);
  };

  const handlePrintReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowReceiptDialog(true);
    // Print will be triggered from the PaymentReceipt component
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
      accessorKey: 'studentInfo.applicationId',
      header: 'Application ID',
      cell: ({ row }) => {
        const appId = row.original.studentInfo.applicationId;
        return <div className="text-sm text-muted-foreground">{appId}</div>;
      },
    },
    {
      accessorKey: 'paymentType',
      header: 'Payment Type',
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
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewReceipt(payment)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePrintReceipt(payment)}
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
          </div>
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
      <Card>
        <CardHeader>
          <CardTitle>Payment Receipts</CardTitle>
          <CardDescription>
            View and print receipts for all completed payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search by student name or reference number..."
                value={(table.getColumn('studentInfo.studentName')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn('studentInfo.studentName')?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
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
                        No paid payments found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {table.getRowModel().rows.length} of {payments.length} receipts
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

      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>
              Receipt for {selectedPayment?.studentInfo.studentName}
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <PaymentReceipt
              payment={selectedPayment}
              onPrint={() => {
                window.print();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
