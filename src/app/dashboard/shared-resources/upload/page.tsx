import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { UploadResourcesForm } from './UploadResourcesForm';

export const dynamic = 'force-dynamic';

export default async function UploadSharedResourcesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { user } = session;

  // Only allow certain roles to upload
  const allowedRoles = ['faculty', 'librarian', 'admin', 'super-admin'];
  if (!allowedRoles.includes(user.role)) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Shared Resources</h1>
          <p className="text-muted-foreground">
            Share educational content with students across all institutions
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <UploadResourcesForm 
        userId={user.email || user.id} 
        userName={user.name}
        userRole={user.role as 'faculty' | 'librarian' | 'admin' | 'super-admin'}
      />

      {/* Upload Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Before Uploading:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Upload your file to Google Drive first</li>
              <li>Make sure the file has "Anyone with the link can view" permission</li>
              <li>Copy the shareable link to paste in the form</li>
              <li>Ensure file names are descriptive</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Supported File Types:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>E-Books:</strong> PDF, EPUB</li>
              <li><strong>Notes:</strong> PDF, DOCX, PPTX</li>
              <li><strong>Video Lectures:</strong> MP4, WebM (or YouTube/Drive links)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Best Practices:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Add relevant tags to help students find your content</li>
              <li>Write clear, concise descriptions</li>
              <li>Keep file sizes reasonable (prefer under 50MB)</li>
              <li>Use standard formats for better compatibility</li>
              <li>Update outdated content by archiving old versions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
