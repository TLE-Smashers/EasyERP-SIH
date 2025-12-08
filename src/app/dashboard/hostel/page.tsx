import { Suspense } from "react";
import Link from "next/link";
import { getHostelApplicationStats } from "@/actions/hostel/getHostelApplications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Building2,
  UserCheck,
  ClipboardList,
  Home,
  Bed,
  QrCode,
} from "lucide-react";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PageHeader } from "@/components/ui/page-header";
import { RoomAllocationTreeMap } from "@/components/dashboard/RoomAllocationTreeMap";
import { HostelOccupancyGauge } from "@/components/dashboard/HostelOccupancyGauge";

// Make this page dynamic
export const dynamic = "force-dynamic";

async function StatsCards() {
  const stats = await getHostelApplicationStats();

  const cards = [
    {
      title: "Total Applications",
      value: stats.total,
      icon: Users,
      description: "All hostel submissions",
      color: "text-blue-600",
    },
    {
      title: "Pending Allocation",
      value: stats.pending,
      icon: Clock,
      description: "Awaiting room allocation",
      color: "text-yellow-600",
    },
    {
      title: "Allocated",
      value: stats.allocated,
      icon: Building2,
      description: "Room assigned",
      color: "text-orange-600",
    },
    {
      title: "Confirmed",
      value: stats.confirmed,
      icon: CheckCircle2,
      description: "Payment completed",
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
      description: "Awaiting confirmation",
      color: "text-purple-600",
    },
    {
      title: "Male Hostel",
      value: stats.maleHostel,
      icon: UserCheck,
      description: "Male applicants",
      color: "text-cyan-600",
    },
    {
      title: "Female Hostel",
      value: stats.femaleHostel,
      icon: UserCheck,
      description: "Female applicants",
      color: "text-pink-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(8)].map((_, i) => (
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

export default async function HostelDashboardPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }
  const userRole = session.user.role;
  if (userRole !== "hostel" && userRole !== "admin") {
    redirect("/dashboard");
  }

  return (
    // <div className="flex-1 space-y-4">
    //   <PageHeader 
    //     title="Hostel Dashboard" 
    //     description="Manage hostel applications, room allocations, and student accommodations"
    //   />

    //   <Suspense fallback={<StatsLoading />}>
    //     <StatsCards />
    //   </Suspense>

    //   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mb-4">
    //     <RoomAllocationTreeMap />
    //     <HostelOccupancyGauge />
    //   </div>

    //   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    //     <Card className="hover:shadow-lg transition-shadow">
    //       <CardHeader>
    //         <CardTitle className="flex items-center gap-2">
    //           <ClipboardList className="h-5 w-5" />
    //           View Applications
    //         </CardTitle>
    //         <CardDescription>
    //           View and manage all hostel applications
    //         </CardDescription>
    //       </CardHeader>
    //       <CardContent>
    //         <Link href="/dashboard/hostel/allocation">
    //           <Button className="w-full">Open Applications</Button>
    //         </Link>
    //       </CardContent>
    //     </Card>

    //     <Card className="hover:shadow-lg transition-shadow">
    //       <CardHeader>
    //         <CardTitle className="flex items-center gap-2">
    //           <QrCode className="h-5 w-5" />
    //           Application Form
    //         </CardTitle>
    //         <CardDescription>
    //           View QR code and hostel form configuration
    //         </CardDescription>
    //       </CardHeader>
    //       <CardContent>
    //         <Link href="/dashboard/hostel/form">
    //           <Button className="w-full" variant="outline">
    //             View QR Code
    //           </Button>
    //         </Link>
    //       </CardContent>
    //     </Card>

    //     <Card className="hover:shadow-lg transition-shadow">
    //       <CardHeader>
    //         <CardTitle className="flex items-center gap-2">
    //           <Bed className="h-5 w-5" />
    //           Room Management
    //         </CardTitle>
    //         <CardDescription>
    //           Manage hostel rooms and allocations
    //         </CardDescription>
    //       </CardHeader>
    //       <CardContent>
    //         <Link href="/dashboard/hostel/rooms">
    //           <Button className="w-full" variant="outline">
    //             Manage Rooms
    //           </Button>
    //         </Link>
    //       </CardContent>
    //     </Card>
    //   </div>

    //   <Card>
    //     <CardHeader>
    //       <CardTitle>Recent Activity</CardTitle>
    //       <CardDescription>
    //         Latest hostel application updates and allocations
    //       </CardDescription>
    //     </CardHeader>
    //     <CardContent>
    //       <div className="text-sm text-muted-foreground">
    //         View detailed applications in the Applications section above.
    //       </div>
    //     </CardContent>
    //   </Card>
    // </div>
    <div>
      Hostel Dashboard TODO
    </div>
  );
}
