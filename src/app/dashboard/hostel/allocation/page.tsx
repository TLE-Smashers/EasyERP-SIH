
import { getHostelApplications } from "@/actions/hostel/getHostelApplications";
import { HostelApplication } from "@/types/hostel";
import { HostelApplicationsTableClient } from "@/components/hostel/HostelApplicationsTableClient";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";

export default async function HostelAllocationPage() {
  const response = await getHostelApplications();
  const applications: HostelApplication[] = response.data || [];

  return (
    <div className="w-full max-w-7xl mx-auto">
      <PageHeader 
        title="Hostel Applications" 
        description="Review and manage all hostel accommodation requests"
        actions={
          <Link href="/dashboard/hostel/rooms">
            <Button variant="outline" className="font-semibold">View Room Allocations</Button>
          </Link>
        }
      />
      <div className="mb-6">
        {/* The filter bar is rendered inside HostelApplicationsTableClient */}
      </div>
      <div className="rounded-xl border bg-background p-0">
        <HostelApplicationsTableClient data={applications} />
      </div>
    </div>

  );
}
