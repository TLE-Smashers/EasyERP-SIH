import { Suspense } from 'react';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LibrarianResourcesManager } from './LibrarianResourcesManager';
import { ResourcesList } from '@/components/library/ResourcesList';

export const dynamic = 'force-dynamic';

export default async function LibrarianResourcesPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  const librarianId = `LIB-${session.user.email.split('@')[0]}`;
  const isAdmin = session.user.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">E-Books & Resources</h1>
        <p className="text-muted-foreground">
          {isAdmin ? 'View and manage all library resources' : 'Manage e-books and view all library resources'}
        </p>
      </div>

      {/* Content */}
      <Suspense fallback={<ResourcesLoading />}>
        {isAdmin ? (
          <ResourcesList showActions role="admin" />
        ) : (
          <LibrarianResourcesManager librarianId={librarianId} />
        )}
      </Suspense>
    </div>
  );
}

function ResourcesLoading() {
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
