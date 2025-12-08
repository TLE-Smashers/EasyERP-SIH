import { Suspense } from "react";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getBooks } from "@/actions/library/getBooks";
import { getStudentRequests } from "@/actions/library/requestBook";
import { getStudentIssuedBooks } from "@/actions/library/issueBook";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, FileText } from "lucide-react";
import { LibraryClientPage } from "./LibraryClientPage";

export const dynamic = "force-dynamic";

async function LibraryStats({ studentId }: { studentId: string }) {
  const [booksResult, requestsResult, issuedResult] = await Promise.all([
    getBooks(),
    getStudentRequests(studentId),
    getStudentIssuedBooks(studentId),
  ]);

  const availableBooks = booksResult.data?.filter(b => b.availableCopies > 0).length || 0;
  const pendingRequests = requestsResult.data?.filter((r: any) => r.status === 'pending').length || 0;
  const issuedBooks = issuedResult.data?.length || 0;

  const cards = [
    {
      title: "Available Books",
      value: availableBooks,
      icon: BookOpen,
      description: "Books ready to request",
      color: "text-blue-600",
    },
    {
      title: "Pending Requests",
      value: pendingRequests,
      icon: Clock,
      description: "Awaiting approval",
      color: "text-yellow-600",
    },
    {
      title: "Books Issued",
      value: issuedBooks,
      icon: FileText,
      description: "Currently with you",
      color: "text-green-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px] mb-2" />
            <Skeleton className="h-3 w-[120px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function StudentLibraryPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // TODO: Get actual student ID from database
  // For now, using email as studentId
  const studentId = `STU-${session.user.email.split('@')[0]}`;

  return (
    <div>
      <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Library</h1>
        <p className="text-muted-foreground">
          Browse books, request to borrow, and manage your issued books
        </p>
      </div>

      {/* Stats */}
      <Suspense fallback={<StatsLoading />}>
        <LibraryStats studentId={studentId} />
      </Suspense>

      {/* Main Content - Client Component */}
      <LibraryClientPage studentId={studentId} studentEmail={session.user.email} />
      </div>
    </div>
  );
}
