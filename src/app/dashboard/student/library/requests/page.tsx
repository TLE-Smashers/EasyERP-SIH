import { Suspense } from "react";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getStudentRequests } from "@/actions/library/requestBook";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MyRequestsClient } from "./MyRequestsClient";

export const dynamic = "force-dynamic";

async function RequestsContent({ studentId }: { studentId: string }) {
  const requestsResult = await getStudentRequests(studentId);
  const requests = requestsResult.data || [];

  return <MyRequestsClient initialRequests={requests} studentId={studentId} />;
}

function RequestsLoading() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Skeleton className="h-5 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function MyRequestsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const studentId = `STU-${session.user.email.split('@')[0]}`;

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Requests</h1>
          <p className="text-muted-foreground">
            Track your book requests and their approval status
          </p>
        </div>

        {/* Content */}
        <Suspense fallback={<RequestsLoading />}>
          <RequestsContent studentId={studentId} />
        </Suspense>
      </div>
    </div>
  );
}
