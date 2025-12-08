"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  Row,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreHorizontal, Eye, ArrowRight } from "lucide-react";
import { parseGoogleFormsDate, formatDateForDisplay } from "@/lib/dateUtils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export interface Application {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  status: "pending" | "documents_verified" | "payment_pending" | "paid" | "completed" | "rejected";
  // make paymentStatus optional to tolerate different API shapes
  paymentStatus?: "unpaid" | "paid" | "partial" | "refunded" | string;
  documentsVerified: boolean;
  locked: boolean;
  rowIndex: number;
}

interface DraggableRowProps {
  row: Row<Application>;
  children: React.ReactNode;
}

function DraggableRow({ row, children }: DraggableRowProps) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: row.id,
    });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    zIndex: isDragging ? 1 : 0,
  };

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('[role="checkbox"]') ||
      target.closest('.cursor-grab')
    ) {
      return;
    }

    // Open final (complete) step for locked/completed applications, otherwise start at step 1
    const step =
      row.original?.locked || row.original?.status === "completed" ? 5 : 1;

    router.push(`/dashboard/admission/applications/${row.original.id}?step=${step}`);
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      onClick={handleRowClick}
      className="cursor-pointer hover:bg-muted/50 transition-colors"
    >
      {children}
    </TableRow>
  );
}

interface TableCellViewerProps {
  application: Application;
}

function TableCellViewer({ application }: TableCellViewerProps) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() =>
        router.push(`/dashboard/admission/application-form-preview/${application.id}`)
      }
      className="h-8 gap-2"
    >
      <Eye className="h-4 w-4" />
      View Full Application
    </Button>
  );
}

function getStatusBadge(status: string) {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "🟡 Pending", variant: "secondary" },
    documents_verified: { label: "🟢 Docs Verified", variant: "default" },
    payment_pending: { label: "🟠 Payment Pending", variant: "outline" },
    paid: { label: "💵 Paid", variant: "default" },
    completed: { label: "✅ Completed", variant: "default" },
    rejected: { label: "🔴 Rejected", variant: "destructive" },
  };

  const item = config[status] || { label: status, variant: "outline" as const };
  return <Badge variant={item.variant} className="whitespace-nowrap inline-flex items-center">{item.label}</Badge>;
}

function getPaymentBadge(status: "pending" | "done") {
  if (status === "done") {
    return (
      <Badge variant="default" className="whitespace-nowrap inline-flex items-center bg-green-600">
        ✅ Done
      </Badge>
    );
  }
  // pending
  return (
    <Badge variant="secondary" className="whitespace-nowrap inline-flex items-center bg-amber-400 text-amber-900">
      🟡 Pending
    </Badge>
  );
}

function simplifyPaymentStatus(raw: unknown): "pending" | "done" {
  // Null / undefined => pending
  if (raw == null) return "pending";

  // Boolean => true means done
  if (typeof raw === "boolean") return raw ? "done" : "pending";

  // Number => treat > 0 as paid (amount)
  if (typeof raw === "number") return raw > 0 ? "done" : "pending";

  // If it's an object, try to read common keys and recurse
  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const candidates = [
      obj.status,
      obj.state,
      // some APIs use snake_case
      obj.payment_status,
      obj.paymentStatus,
      obj.result,
      obj.success,
    ];
    for (const c of candidates) {
      if (c != null) return simplifyPaymentStatus(c);
    }
    // fallback to stringifying object
    try {
      const s = JSON.stringify(raw);
      return simplifyPaymentStatus(s);
    } catch {
      return "pending";
    }
  }

  // String handling
  const s = String(raw).toLowerCase().trim();

  // Common keywords that indicate a successful/completed payment
  const doneKeywords = [
    "paid",
    "paid_full",
    "succeeded",
    "success",
    "captured",
    "completed",
    "ok",
    "done",
    "settled",
    "approved",
    "true",
  ];

  return doneKeywords.some((k) => s.includes(k)) ? "done" : "pending";
}

interface ApplicationsTableProps {
  data: Application[];
  onUpdate: () => void;
}

export function ApplicationsTable({ data: initialData, onUpdate }: ApplicationsTableProps) {
  const [data, setData] = React.useState(initialData);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortOrder, setSortOrder] = React.useState<'recent' | 'oldest'>('recent');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  // reference onUpdate to avoid unused variable lint (keeps API stable for callers)
  React.useEffect(() => {
    void onUpdate;
  }, [onUpdate]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  // Update data when initialData changes
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Apply client-side filters/sorting/search whenever inputs change
  React.useEffect(() => {
    let filtered = initialData.slice();

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((it) => String(it.status) === statusFilter);
    }

    // Search by id, name, email or phone
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((it) => {
        return (
          String(it.id).toLowerCase().includes(q) ||
          String(it.name ?? '').toLowerCase().includes(q) ||
          String(it.email ?? '').toLowerCase().includes(q) ||
          String(it.phone ?? '').toLowerCase().includes(q)
        );
      });
    }

    // Sort by timestamp using parseGoogleFormsDate to handle Google Forms format
    filtered.sort((a, b) => {
      const da = parseGoogleFormsDate(String(a.timestamp));
      const db = parseGoogleFormsDate(String(b.timestamp));
      const ta = da.getTime() || 0;
      const tb = db.getTime() || 0;
      return sortOrder === 'recent' ? tb - ta : ta - tb;
    });

    setData(filtered);
  }, [initialData, statusFilter, searchQuery, sortOrder]);

  const columns: ColumnDef<Application>[] = [
    {
      id: "drag",
      header: "",
      cell: () => {
        // Avoid calling hooks inside a cell renderer; the drag handle is purely visual here.
        return (
          <div className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
        );
      },
      size: 40,
    },
    {
      accessorKey: "timestamp",
      header: "Date",
      cell: ({ row }) => {
        const timestamp = row.getValue("timestamp") as string;
        return <div className="text-sm py-1">{formatDateForDisplay(timestamp)}</div>;
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium py-1">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div className="text-sm py-1">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <div className="text-sm py-1">{row.getValue("phone")}</div>,
    },
    {
      accessorKey: "course",
      header: "Course",
      cell: ({ row }) => <div className="text-sm py-1">{row.getValue("course")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <div className="py-1">{getStatusBadge(row.getValue("status"))}</div>,
    },
    {
      accessorKey: "documentsVerified",
      header: "Docs Verified",
      cell: ({ row }) => {
        const verified = row.getValue("documentsVerified") as boolean;
        return (
          <div className="py-1">
            {verified ? (
              <Badge variant="default" className="gap-1">
                <span className="text-xs">✓</span> Verified
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <span className="text-xs">○</span> Pending
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "paymentStatus",
      // return raw value (can be string, boolean, number or object) so simplifyPaymentStatus can decide
      accessorFn: (row) => {
        const r = row as unknown as Record<string, unknown>;
        if (r.paymentStatus != null) return r.paymentStatus;
        if (r.payment_status != null) return r.payment_status;
        if (r.payment != null) return r.payment;
        const s = typeof r.status === "string" ? String(r.status) : undefined;
        if (s && /paid|completed/i.test(s)) return s;
        return undefined;
      },
      header: "Payment",
      cell: ({ getValue }) => {
        const raw = getValue(); // could be any type
        const simple = simplifyPaymentStatus(raw);
        return <div className="py-1">{getPaymentBadge(simple)}</div>;
      },
    },
    {
      accessorKey: "locked",
      header: "Locked",
      cell: ({ row }) => {
        const locked = row.getValue("locked") as boolean;
        return (
          <div className="py-1">
            {locked ? (
              <Badge variant="default" className="gap-1 bg-green-600">
                <span className="text-xs">🔒</span> Locked
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <span className="text-xs">○</span> Open
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <TableCellViewer application={row.original} />
      ),
      size: 120,
    },
  ];

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
    getRowId: (row) => row.id,
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = data.findIndex((item) => item.id === active.id);
        const newIndex = data.findIndex((item) => item.id === over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  const dataIds = React.useMemo(() => data.map((item) => item.id), [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-6 pt-4 space-x-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={(v) => setSortOrder(v as 'recent' | 'oldest')}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort: Recent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Search by name, id, email or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Button
                variant="outline"
                onClick={() => {
                  // search is already applied on state change; keep button for explicit intention
                  setSearchQuery((s) => s.trim());
                }}
              >
                Search
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setSortOrder('recent');
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-x-auto">
        <div className="rounded-md border min-w-max mx-4">
          <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
          >
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
                <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </DraggableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No applications found.
                      </TableCell>
                    </TableRow>
                  )}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2 px-6 pb-4">
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
  );
}
