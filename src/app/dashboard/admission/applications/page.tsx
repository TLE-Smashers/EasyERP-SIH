import { Suspense } from "react";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { getApplications } from "@/actions/admission/getApplications";
import { ApplicationsTable, type Application } from "@/components/admission/ApplicationsTable";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Make this page dynamic
export const dynamic = "force-dynamic";

async function ApplicationsList() {
  const applications = await getApplications();

  // Applications are already in the correct format from getApplications
  const transformedApplications: Application[] = applications.map((app: any) => ({
    id: app.id,
    timestamp: app.timestamp,
    name: app.name,
    email: app.email,
    phone: app.phone,
    course: app.course,
    status: app.status as Application["status"],
    paymentStatus: app.paymentStatus as Application["paymentStatus"],
    documentsVerified: app.documentsVerified,
    locked: app.locked,
    rowIndex: app.rowIndex,
  }));

  async function handleUpdate() {
    "use server";
    revalidatePath("/dashboard/admission/applications");
  }

  return (
    <ApplicationsTable 
      data={transformedApplications} 
      onUpdate={handleUpdate} 
    />
  );
}

function ApplicationsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <div className="flex-1 space-y-6 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Applications"
          description="View and manage all admission applications. Click on any row to view details and take actions."
        />
        <Link href="/dashboard/admission/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            New Application
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <div className="overflow-x-auto">
          <Suspense fallback={<ApplicationsLoading />}>
            <ApplicationsList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
