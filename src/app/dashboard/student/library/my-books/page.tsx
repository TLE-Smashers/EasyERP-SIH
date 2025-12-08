import { Suspense } from "react";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getStudentIssuedBooks } from "@/actions/library/issueBook";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MyBooksClient } from "./MyBooksClient";

export const dynamic = "force-dynamic";

async function BooksContent({ studentId }: { studentId: string }) {
  const issuedResult = await getStudentIssuedBooks(studentId);
  const issuedBooks = issuedResult.data || [];

  return <MyBooksClient initialBooks={issuedBooks} studentId={studentId} />;
}

function BooksLoading() {
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

export default async function MyBooksPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">My Books</h1>
          <p className="text-muted-foreground">
            Books currently issued to you and their due dates
          </p>
        </div>

        {/* Content */}
        <Suspense fallback={<BooksLoading />}>
          <BooksContent studentId={studentId} />
        </Suspense>
      </div>
    </div>
  );
}
