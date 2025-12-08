import { Suspense } from "react";
import Link from "next/link";
import { getApplicationStats } from "@/actions/admission/getApplications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  FileCheck,
  QrCode,
  ClipboardList,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

// Make this page dynamic
export const dynamic = "force-dynamic";

async function StatsCards() {
  const stats = await getApplicationStats();

  const cards = [
    {
      title: "Total Applications",
      value: stats.total,
      icon: Users,
      description: "All submissions",
      color: "text-blue-600",
    },
    {
      title: "Pending Review",
      value: stats.pending,
      icon: Clock,
      description: "Awaiting verification",
      color: "text-yellow-600",
    },
    {
      title: "Verified",
      value: stats.verified,
      icon: CheckCircle2,
      description: "Approved applications",
      color: "text-green-600",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      description: "Declined applications",
      color: "text-red-600",
    },
    {
      title: "Payment Pending",
      value: stats.paymentPending,
      icon: DollarSign,
      description: "Awaiting payment",
      color: "text-orange-600",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: FileCheck,
      description: "Fully processed",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">{card.title}</CardTitle>
              <Icon className={`h-6 w-6 ${card.color}`} />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-3xl font-bold">{card.value}</div>
              <p className="text-sm text-muted-foreground mt-0.5">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <Skeleton className="h-5 w-[120px]" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-[80px] mb-2" />
            <Skeleton className="h-4 w-[140px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdmissionDashboard() {
  return (
    <div className="flex-1 space-y-4">
      <DashboardHeader title="Admission Dashboard" />

      <Suspense fallback={<StatsLoading />}>
        <StatsCards />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              View Applications
            </CardTitle>
            <CardDescription>
              View and manage all admission applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admission/applications">
              <Button className="w-full">Open Applications</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Application Form
            </CardTitle>
            <CardDescription>
              View QR code and form configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admission/new">
              <Button className="w-full" variant="outline">
                View QR Code
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
