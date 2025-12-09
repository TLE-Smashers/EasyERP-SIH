import { Suspense } from "react";
import { AllStudentsClient } from "./AllStudentsClient";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "All Students | Easy ERP",
  description: "View and manage all students",
};

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-48" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export default function AllStudentsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AllStudentsClient />
    </Suspense>
  );
}
