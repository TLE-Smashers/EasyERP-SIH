import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getApplicationStats } from "@/actions/admission/getApplications";
import {
  GraduationCap,
  Wallet,
  Hotel,
  Library,
  Users,
  BookOpen,
  ArrowRight,
  TrendingUp,
  TrendingUp as TrendingUpIcon
} from "lucide-react";
import { AdmissionChart } from "@/components/dashboard/AdmissionChart";
import { ApplicationTrendChart } from "@/components/dashboard/ApplicationTrendChart";
import { DepartmentPieChart } from "@/components/dashboard/DepartmentPieChart";
import { ApplicantResourcesCard } from "@/components/dashboard/ApplicantResourcesCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import JobReferralNotices from "@/components/job-referral-notices";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userRole = (session.user as any).role;

  // Log for debugging
  console.log('Dashboard access - User role:', userRole);

  // Only admin users see the overview dashboard
  // Other roles MUST be redirected to their specific module dashboards
  if (userRole === "librarian") {
    redirect("/dashboard/library");
  } else if (userRole === "admission") {
    redirect("/dashboard/admission");
  } else if (userRole === "accountant") {
    redirect("/dashboard/accounts");
  } else if (userRole === "warden" || userRole === "hostel") {
    redirect("/dashboard/hostel");
  } else if (userRole === "student") {
    redirect("/dashboard/student");
  } else if (userRole !== "admin") {
    // Fallback for any other non-admin role
    redirect("/login");
  }

  // Fetch real stats
  let admissionStats = {
    total: 0,
    pending: 0,
    verified: 0,
    paymentPending: 0,
    completed: 0,
    rejected: 0,
  };

  try {
    admissionStats = await getApplicationStats();
  } catch (error) {
    console.error("Error fetching stats:", error);
  }

  // Admin Dashboard - Overview of all modules
  const modules = [
    {
      title: "Admission",
      description: "Manage student applications and admissions",
      icon: GraduationCap,
      href: "/dashboard/admission",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      stats: "View dashboard",
    },
    {
      title: "Accounts",
      description: "Fee collection, receipts, and financial reports",
      icon: Wallet,
      href: "/dashboard/accounts",
      color: "text-green-600",
      bgColor: "bg-green-50",
      stats: "View dashboard",
    },
    {
      title: "Hostel",
      description: "Room allocation and hostel management",
      icon: Hotel,
      href: "/dashboard/hostel",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      stats: "View dashboard",
    },
    {
      title: "Library",
      description: "Book management and issue/return tracking",
      icon: Library,
      href: "/dashboard/library",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      stats: "View dashboard",
    },
    {
      title: "Students",
      description: "Student records and academic information",
      icon: Users,
      href: "/dashboard/students",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      stats: "View all",
    },
    {
      title: "Faculty",
      description: "Faculty management and assignments",
      icon: BookOpen,
      href: "/dashboard/faculty",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      stats: "View all",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <DashboardHeader
        title="Admin Dashboard"
        description={`Welcome back, ${session.user.name}. Here's your system overview.`}
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Total Applications</CardTitle>
            <GraduationCap className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-3xl font-bold">{admissionStats.total}</div>
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="text-green-600">+{admissionStats.pending}</span> pending review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Verified</CardTitle>
            <Users className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-3xl font-bold">{admissionStats.verified}</div>
            <p className="text-sm text-muted-foreground mt-0.5">Documents verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-medium">Payment Pending</CardTitle>
            <Wallet className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{admissionStats.paymentPending}</div>
            <p className="text-sm text-muted-foreground mt-1">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Completed</CardTitle>
            <Library className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-3xl font-bold">{admissionStats.completed}</div>
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="text-red-600">{admissionStats.rejected}</span> rejected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <ApplicationTrendChart />
        <DepartmentPieChart />
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-3">
        <AdmissionChart stats={admissionStats} />

        <Card>
          <CardHeader>
            <CardTitle>Module Usage</CardTitle>
            <CardDescription>Activity across different modules</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Admission</span>
                  <span className="font-medium">{admissionStats.total}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${admissionStats.total > 0 ? Math.min((admissionStats.total / (admissionStats.total + 10)) * 100, 100) : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Library</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-orange-600" style={{ width: "0%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Accounts</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-green-600" style={{ width: "0%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Hostel</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600" style={{ width: "0%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <ApplicantResourcesCard />
      </div>

      {/* Module Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Module Dashboards</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${module.bgColor}`}>
                      <Icon className={`h-6 w-6 ${module.color}`} />
                    </div>
                  </div>
                  <CardTitle className="mt-4">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={module.href}>
                    <Button variant="outline" className="w-full group">
                      {module.stats}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Alumni Job Referrals Section */}
      <JobReferralNotices maxDisplay={3} showHeader={true} />

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates across all modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">New application received</p>
                  <p className="text-xs text-muted-foreground">Admission Module</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Just now</span>
            </div>
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No recent activity</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
