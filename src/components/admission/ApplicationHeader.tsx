/**
 * Application Header Component
 * Shows application ID, status, and back navigation
 */

"use client";

import { PageHeader } from "@/components/ui/page-header";
import { ApplicationStatus } from "@/types/admission";
import { format } from "date-fns";
import { parseGoogleFormsDate } from "@/lib/dateUtils";

interface ApplicationHeaderProps {
  applicationId: string;
  status: ApplicationStatus;
  submissionDate: string;
  studentName: string;
}

const statusConfig: Record<ApplicationStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
  pending: { label: "🟡 Pending Review", variant: "warning" },
  documents_verified: { label: "✅ Documents Verified", variant: "success" },
  payment_pending: { label: "🟠 Payment Pending", variant: "warning" },
  paid: { label: "💵 Paid", variant: "success" },
  completed: { label: "✅ Completed", variant: "success" },
  rejected: { label: "🔴 Rejected", variant: "destructive" },
};

export function ApplicationHeader({
  applicationId,
  status,
  submissionDate,
  studentName,
}: ApplicationHeaderProps) {
  const config = statusConfig[status] || statusConfig.pending;
  
  const parsedDate = parseGoogleFormsDate(submissionDate);
  const formattedDate = format(parsedDate, "MMMM do, yyyy");
  const description = `${applicationId} • Submitted on ${formattedDate}`;

  return (
    <PageHeader
      title={studentName}
      description={description}
      backLabel="Back to Applications"
      backHref="/dashboard/admission/applications"
      badge={{
        label: config.label,
        variant: config.variant,
      }}
    />
  );
}
