import { Suspense } from 'react';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton'
import { ResourcesBrowser } from './ResourcesBrowser';

export const dynamic = 'force-dynamic';

export default async function StudentResourcesPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">E-Books & Resources</h1>
        <p className="text-muted-foreground">
          Access e-books, lecture notes, and research papers
        </p>
      </div>

      {/* Content */}
      <Suspense fallback={<ResourcesLoading />}>
        <ResourcesBrowser />
      </Suspense>
    </div>
  );
}

function ResourcesLoading() {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
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
