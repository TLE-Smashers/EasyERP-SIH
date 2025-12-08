

"use client";
// Utility to normalize paymentConfirmed check
function isPaymentConfirmed(val: unknown): boolean {
  return val === true || val === 1 || val === "TRUE";
}

import * as React from "react";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/DataTable";
import { HostelApplication } from "@/types/hostel";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";

interface HostelApplicationsTableProps {
  data: HostelApplication[];
  onAllocate?: (studentId: string, gender: "male" | "female") => void;
  onConfirm?: (studentId: string) => void;
  onBulkAllocate?: (gender: "male" | "female") => void;
  onBulkReallocate?: (gender: "male" | "female") => void;
  onDeallocate?: (studentId: string) => void;
  onAllocateAll?: (gender: "male" | "female") => void;
  onPay?: (app: HostelApplication) => void;
  rowLoading?: { [studentId: string]: string | null };
}

function getStatusBadge(status: string) {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "🟡 Pending", variant: "secondary" },
    allocated: { label: "🟢 Allocated", variant: "default" },
    confirmed: { label: "✅ Confirmed", variant: "default" },
    rejected: { label: "🔴 Rejected", variant: "destructive" },
  };
  const item = config[status] || { label: status, variant: "outline" as const };
  return <Badge variant={item.variant} className="whitespace-nowrap inline-flex items-center">{item.label}</Badge>;
}

export function HostelApplicationsTable(props: HostelApplicationsTableProps) {
  const { data, onAllocate, onConfirm, onBulkAllocate, onBulkReallocate, onDeallocate, rowLoading = {} } = props;
  const [gender, setGender] = React.useState<"male" | "female">("male");
  const filtered: HostelApplication[] = React.useMemo(() =>
    (Array.isArray(data) ? data : []).filter((app: HostelApplication) => app.gender.toLowerCase() === gender),
    [data, gender]
  );

  const columns = React.useMemo(() => [
    {
      accessorKey: "studentId",
      header: "Student ID",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "fullName",
      header: "Name",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "contactNumber",
      header: "Contact",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: (info: any) => (
        <Badge variant={info.getValue()?.toLowerCase() === "male" ? "default" : "secondary"}>
          {info.getValue()?.toLowerCase() === "male" ? "Male" : "Female"}
        </Badge>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "entrancePercentage",
      header: "Entrance %",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "currentYear",
      header: "Current Year",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "session",
      header: "Session",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info: any) => getStatusBadge(info.getValue()),
    },
    {
      accessorKey: "roomNumber",
      header: "Room",
      cell: (info: any) => info.getValue() || <span className="text-muted-foreground">Not allocated</span>,
    },
    {
      accessorKey: "paymentConfirmed",
      header: "Payment",
      cell: (info: any) => {
        const value = info.getValue();
            if (isPaymentConfirmed(value)) {
              return <Badge variant="default">Paid</Badge>;
            }
            return <Badge variant="secondary">Pending</Badge>;
      },
    },
  ], []);

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data}
        renderRowActions={(app: HostelApplication) => (
          <div className="flex gap-2 items-center">
            {(app.status === "pending" || app.status === "deallocated") && onAllocate && (
              <Button size="sm" variant="outline" onClick={() => onAllocate(app.studentId, app.gender)} disabled={rowLoading[app.studentId] === "allocate"} className="flex items-center gap-1">
                {rowLoading[app.studentId] === "allocate" ? <Spinner size={16} /> : <ArrowRight className="w-4 h-4 mr-1" />}
                <span>Allocate</span>
              </Button>
            )}
            {app.status === "allocated" && onConfirm && (
              <Button size="sm" variant="default" onClick={() => onConfirm(app.studentId)} className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                <span>Confirm</span>
              </Button>
            )}
            {(app.status === "allocated" || app.status === "confirmed") && onDeallocate && (
              <Button size="sm" variant="destructive" onClick={() => onDeallocate(app.studentId)} disabled={rowLoading[app.studentId] === "deallocate"} className="flex items-center gap-1">
                {rowLoading[app.studentId] === "deallocate" ? <Spinner size={16} /> : <XCircle className="w-4 h-4 mr-1" />}
                <span>Deallocate</span>
              </Button>
            )}
            {app.status === "allocated" && !isPaymentConfirmed(app.paymentConfirmed) && (
                <Button size="sm" variant="secondary" onClick={() => props.onPay && props.onPay(app)} className="flex items-center gap-1">
                  <ArrowRight className="w-4 h-4 mr-1" />
                  <span>💳 Pay</span>
                </Button>
            )}

            {app.status === "rejected" && (
              <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-4 h-4 mr-1" /><span>Rejected</span></Badge>
            )}
          </div>
        )}
      />
    </div>
  );
}
