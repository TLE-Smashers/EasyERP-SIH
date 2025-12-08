import { Suspense } from "react";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLibraryStats } from "@/actions/library/getBooks";
import { getPendingRequests } from "@/actions/library/approveRequest";
import { getAllIssuedBooks, getOverdueBooks } from "@/actions/library/issueBook";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, FileText, AlertCircle, ArrowRight, Library, TrendingUp, CheckCircle2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export const dynamic = "force-dynamic";

async function LibrarianStats() {
  const [statsResult, pendingResult, issuedResult, overdueResult] = await Promise.all([
    getLibraryStats(),
    getPendingRequests(),
    getAllIssuedBooks(),
    getOverdueBooks(),
  ]);

  const stats = statsResult.data || { totalBooks: 0, totalCopies: 0, availableCopies: 0, issuedCopies: 0 };
  const pendingCount = pendingResult.data?.length || 0;
  const issuedCount = issuedResult.data?.length || 0;
  const overdueCount = overdueResult.data?.length || 0;

  const cards = [
    {
      title: "Total Books",
      value: stats.totalBooks,
      icon: BookOpen,
      description: `${stats.totalCopies} total copies`,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      iconBg: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Pending Requests",
      value: pendingCount,
      icon: Clock,
      description: "Awaiting approval",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
      iconBg: "bg-yellow-100 dark:bg-yellow-900",
      link: "/dashboard/library/requests",
    },
    {
      title: "Issued Books",
      value: issuedCount,
      icon: FileText,
      description: "Currently with students",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      iconBg: "bg-green-100 dark:bg-green-900",
      link: "/dashboard/library/issues",
    },
    {
      title: "Overdue Books",
      value: overdueCount,
      icon: AlertCircle,
      description: "Past due date",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
      iconBg: "bg-red-100 dark:bg-red-900",
      link: "/dashboard/library/issues?filter=overdue",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const content = (
          <>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{card.value}</div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                {card.description}
              </p>
            </CardContent>
          </>
        );

        if (card.link) {
          return (
            <Link key={card.title} href={card.link}>
              <Card className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 ${card.color.replace('text-', 'border-l-')}`}>
                {content}
              </Card>
            </Link>
          );
        }

        return (
          <Card key={card.title} className={`border-l-4 ${card.color.replace('text-', 'border-l-')}`}>
            {content}
          </Card>
        );
      })}
    </div>
  );
}

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
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

export default async function LibraryDashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // TODO: Add role check for librarian
  // if (session.user.role !== 'librarian' && session.user.role !== 'admin') {
  //   redirect("/dashboard");
  // }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <DashboardHeader 
        title="Library Management" 
        description="Manage books, requests, and issued books efficiently"
      />

      {/* Stats Cards */}
      <Suspense fallback={<StatsLoading />}>
        <LibrarianStats />
      </Suspense>

      {/* Quick Actions Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Manage Requests</CardTitle>
                  <CardDescription className="text-sm">Approve or reject book requests</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/library/requests">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  View Requests
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Issued Books</CardTitle>
                  <CardDescription className="text-sm">Track and manage issued books</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/library/issues">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  View Issues
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Book Catalog</CardTitle>
                  <CardDescription className="text-sm">Manage library book collection</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/library/books">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Manage Books
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
