"use client";

import * as React from "react";
import {
  Wallet,
  Calendar,
  Receipt,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudentProfile } from "@/hooks/use-student-profile";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const MOCK_FEE_ITEMS = [
  {
    label: "Tuition Fee",
    amount: 60000,
    status: "paid",
    paidOn: "2025-08-01",
    reference: "TXN87412",
  },
  {
    label: "Hostel & Mess",
    amount: 28000,
    status: "paid",
    paidOn: "2025-09-10",
    reference: "TXN88310",
  },
  {
    label: "Exam Fee",
    amount: 4000,
    status: "pending",
    dueDate: "2025-11-30",
  },
  {
    label: "Library & Activity",
    amount: 2500,
    status: "pending",
    dueDate: "2025-12-15",
  },
] as const;

type FeeItem = (typeof MOCK_FEE_ITEMS)[number];

export default function StudentFeeStatusPage() {
  const { student, isLoading, error } = useStudentProfile();

  const summary = React.useMemo(() => {
    const total = MOCK_FEE_ITEMS.reduce((sum, item) => sum + item.amount, 0);
    const paid = MOCK_FEE_ITEMS.filter((item) => item.status === "paid").reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const pending = total - paid;

    const nextDue = MOCK_FEE_ITEMS.find((item) => item.status === "pending")?.dueDate;

    return {
      total,
      paid,
      pending,
      completion: total ? Math.round((paid / total) * 100) : 0,
      nextDue,
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Status</h1>
          <p className="text-muted-foreground">
            Track payments and upcoming dues
          </p>
        </div>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {error || "Your profile data is unavailable. Please contact the accounts team."}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fee Status</h1>
        <p className="text-muted-foreground">
          Real-time snapshot of your academic dues and payments
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" /> Overall Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryTile label="Total" value={currency.format(summary.total)} />
              <SummaryTile label="Paid" value={currency.format(summary.paid)} />
              <SummaryTile label="Pending" value={currency.format(summary.pending)} />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Payment Completion</span>
                <span>{summary.completion}%</span>
              </div>
              <Progress value={summary.completion} className="mt-2 h-2" />
            </div>
            {summary.nextDue && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <p className="font-medium text-foreground">Next due date</p>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(summary.nextDue)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> Action Center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Complete your pending payments online or download the latest
              statement for your records.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/dashboard/accounts/fees">Pay Now</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/accounts/receipts">Download Receipt</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" /> Fee Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {MOCK_FEE_ITEMS.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-base font-medium text-foreground">
                  {item.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.status === "paid"
                    ? `Paid on ${formatDate(item.paidOn)} • Ref ${item.reference}`
                    : `Due by ${formatDate(item.dueDate)}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-lg font-semibold">
                  {currency.format(item.amount)}
                </p>
                <Badge variant={item.status === "paid" ? "default" : "secondary"}>
                  {item.status === "paid" ? "Paid" : "Pending"}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" /> Payment Status
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <StatusCard
            title="Cleared Payments"
            description="Tuition fee and hostel dues are fully settled for the current semester."
            icon={CheckCircle2}
            tone="success"
          />
          <StatusCard
            title="Pending Items"
            description="Exam and library fees remain pending. Complete payment before the due date to avoid late charges."
            icon={AlertTriangle}
            tone="warning"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card/70 p-3 text-center">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-lg font-semibold text-foreground mt-1">{value}</p>
    </div>
  );
}

function StatusCard({
  title,
  description,
  icon: Icon,
  tone,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: "success" | "warning";
}) {
  const toneClasses =
    tone === "success"
      ? "border-green-200 bg-green-50 text-green-900"
      : "border-amber-200 bg-amber-50 text-amber-900";

  return (
    <div className={`rounded-lg border p-4 ${toneClasses}`}>
      <div className="flex items-center gap-2 font-medium">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <p className="text-sm mt-2">{description}</p>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
