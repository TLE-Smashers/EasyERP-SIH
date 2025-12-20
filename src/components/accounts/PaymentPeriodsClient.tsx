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
import { ArrowUpDown, Plus, Edit, Calendar } from 'lucide-react';

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
import { Switch } from '@/components/ui/switch';
import { CreatePaymentPeriodSheet } from './CreatePaymentPeriodSheet';
import {
  fetchAllPeriodsAction,
  updatePeriodStatusAction,
} from '@/actions/paymentPeriod/paymentPeriodActions';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import type { PaymentPeriod } from '@/types/paymentPeriod';

interface PaymentPeriodsClientProps {
  initialPeriods: PaymentPeriod[];
}

export function PaymentPeriodsClient({ initialPeriods }: PaymentPeriodsClientProps) {
  'use no memo';
  const { data: session } = useSession();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [periods, setPeriods] = React.useState<PaymentPeriod[]>(initialPeriods);
  const [showCreateSheet, setShowCreateSheet] = React.useState(false);
  const [selectedPeriod, setSelectedPeriod] = React.useState<PaymentPeriod | null>(null);

  // Load periods
  const loadPeriods = React.useCallback(async () => {
    try {
      const result = await fetchAllPeriodsAction();
      if (result.success) {
        setPeriods(result.periods || []);
      } else {
        toast.error('Failed to load payment periods');
      }
    } catch {
      toast.error('Error loading payment periods');
    }
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (period: PaymentPeriod) => {
    const now = new Date();
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);

    if (period.status === 'disabled') {
      return <Badge variant="secondary">Disabled</Badge>;
    }

    if (now > endDate) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    if (now < startDate) {
      return <Badge className="bg-green-500 hover:bg-green-600">Scheduled</Badge>;
    }

    return <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>;
  };

  const handleToggleStatus = async (period: PaymentPeriod) => {
    const newStatus = period.status === 'enabled' ? 'disabled' : 'enabled';
    const userEmail = session?.user?.email || 'system';

    try {
      const result = await updatePeriodStatusAction(period.id, newStatus, userEmail);
      if (result.success) {
        toast.success(`Payment period ${newStatus === 'enabled' ? 'enabled' : 'disabled'}`);
        await loadPeriods();
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch {
      toast.error('Error updating payment period status');
    }
  };

  const columns: ColumnDef<PaymentPeriod>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const period = row.original;
        return (
          <div>
            <div className="font-medium">{period.title}</div>
            {period.description && (
              <div className="text-sm text-muted-foreground">{period.description}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        return (
          <Badge variant="outline" className="capitalize">
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'academicYear',
      header: 'Academic Year',
      cell: ({ row }) => {
        const year = row.getValue('academicYear') as string;
        const semester = row.original.semester;
        return (
          <div className="text-sm">
            <div>{year}</div>
            {semester && <div className="text-muted-foreground">Sem {semester}</div>}
          </div>
        );
      },
    },
    {
      accessorKey: 'startDate',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Duration
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const startDate = row.getValue('startDate') as string;
        const endDate = row.original.endDate;
        return (
          <div className="text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(startDate)}
            </div>
            <div className="text-muted-foreground">to {formatDate(endDate)}</div>
          </div>
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
      accessorKey: 'targetCourses',
      header: 'Targets',
      cell: ({ row }) => {
        const period = row.original;
        return (
          <div className="text-xs">
            <div>{period.targetCourses}</div>
            <div className="text-muted-foreground">{period.targetBranches}</div>
            <div className="text-muted-foreground">Year {period.targetYears}</div>
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const period = row.original;
        return (
          <div className="space-y-2">
            {getStatusBadge(period)}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const period = row.original;
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={period.status === 'enabled'}
              onCheckedChange={() => handleToggleStatus(period)}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedPeriod(period);
                setShowCreateSheet(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: periods,
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

  // Statistics
  const stats = React.useMemo(() => {
    const now = new Date();
    const active = periods.filter((p) => {
      const startDate = new Date(p.startDate);
      const endDate = new Date(p.endDate);
      return p.status === 'enabled' && now >= startDate && now <= endDate;
    }).length;
    const scheduled = periods.filter((p) => {
      const startDate = new Date(p.startDate);
      return p.status === 'enabled' && now < startDate;
    }).length;
    const expired = periods.filter((p) => {
      const endDate = new Date(p.endDate);
      return now > endDate;
    }).length;

    return { total: periods.length, active, scheduled, expired };
  }, [periods]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Periods</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Now</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats.active}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Scheduled</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.scheduled}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Expired</CardDescription>
            <CardTitle className="text-2xl text-gray-600">{stats.expired}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Periods Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Payment Periods</CardTitle>
              <CardDescription>
                Create and manage payment periods for students
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setSelectedPeriod(null);
                setShowCreateSheet(true);
              }}
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Period
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search by title..."
                value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn('title')?.setFilterValue(event.target.value)
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
                        No payment periods found. Create one to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {table.getRowModel().rows.length} of {periods.length} periods
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

      {/* Create/Edit Dialog */}
      <CreatePaymentPeriodSheet
        open={showCreateSheet}
        onOpenChange={setShowCreateSheet}
        period={selectedPeriod}
        onSuccess={() => {
          loadPeriods();
          toast.success(
            selectedPeriod ? 'Payment period updated' : 'Payment period created'
          );
          setSelectedPeriod(null);
        }}
      />
    </div>
  );
}
