import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FacultyUploadForm } from './FacultyUploadForm';
import { BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FacultyUploadPage() {
  const session = await auth();

  if (!session?.user?.email || session.user.role !== 'faculty') {
    redirect('/login');
  }

  // Use email as faculty identifier
  const facultyId = session.user.email;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Resources</h1>
          <p className="text-muted-foreground">
            Share lecture notes, research papers, and study materials with students
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <FacultyUploadForm facultyId={facultyId} />

      {/* Upload Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Before Uploading:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Upload your file to Google Drive first</li>
              <li>Set sharing permissions to &quot;Anyone with the link can view&quot;</li>
              <li>Copy the shareable link</li>
              <li>Choose appropriate category and add relevant tags</li>
              <li>Provide a clear description to help students understand the content</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Supported File Types:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>PDF - Recommended for notes and papers</li>
              <li>DOCX - Word documents</li>
              <li>PPTX - PowerPoint presentations</li>
              <li>XLSX - Excel spreadsheets</li>
              <li>TXT - Plain text files</li>
              <li>EPUB - E-book format</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Best Practices:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Use clear, descriptive titles</li>
              <li>Add your name as author for attribution</li>
              <li>Include relevant tags for better discoverability</li>
              <li>Ensure content is accurate and up-to-date</li>
              <li>Check file integrity before uploading</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
