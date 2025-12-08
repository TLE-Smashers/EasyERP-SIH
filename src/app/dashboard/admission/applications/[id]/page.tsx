/**
 * Application Detail Page
 * Multi-step application review and processing
 * URL-based step navigation: ?step=1|2|3|4|5
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fetchApplication } from "@/actions/admission/fetchApplication";
import { ApplicationDetailClient } from "./ApplicationDetailClient";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string; payment?: string }>;
}

export default async function ApplicationDetailPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const { id } = params;
  const currentStep = Number(searchParams.step) || 1;
  const paymentStatus = searchParams.payment; // 'success', 'failed', or undefined

  // Validate step
  if (currentStep < 1 || currentStep > 5) {
    notFound();
  }

  // Fetch application data
  const response = await fetchApplication(id);

  if (!response.success || !response.data) {
    notFound();
  }

  return (
    <Suspense fallback={<ApplicationDetailSkeleton />}>
      <ApplicationDetailClient
        application={response.data}
        currentStep={currentStep}
        paymentStatus={paymentStatus}
      />
    </Suspense>
  );
}

function ApplicationDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-8 w-[150px]" />
      </div>
      <Skeleton className="h-[100px] w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
