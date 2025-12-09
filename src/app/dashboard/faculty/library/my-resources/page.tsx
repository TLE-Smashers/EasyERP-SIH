import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MyUploadsManager } from '@/components/faculty/MyUploadsManager';

export const dynamic = 'force-dynamic';

export default async function MyResourcesPage() {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== 'faculty') {
    redirect('/login');
  }

  // Use email as faculty identifier
  const facultyId = session.user.email;

  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <MyUploadsManager facultyId={facultyId} />
      </Suspense>
    </div>
  );
}
