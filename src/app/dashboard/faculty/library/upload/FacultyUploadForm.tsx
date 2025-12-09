'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadResourceForm } from '@/components/library/UploadResourceForm';
import { UploadNoteForm } from '@/components/faculty/UploadNoteForm';
import { useRouter } from 'next/navigation';
import { BookOpen, FileText } from 'lucide-react';

interface FacultyUploadFormProps {
  facultyId: string;
}

export function FacultyUploadForm({ facultyId }: FacultyUploadFormProps) {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to my uploads page after successful upload
    router.push('/dashboard/faculty/library/my-resources');
  };

  return (
    <Tabs defaultValue="notes" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="notes" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Upload Notes
        </TabsTrigger>
        <TabsTrigger value="resources" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Upload Resources
        </TabsTrigger>
      </TabsList>

      <TabsContent value="notes">
        <Card>
          <CardHeader>
            <CardTitle>Upload New Note</CardTitle>
            <CardDescription>
              Share lecture notes, study materials, and course content with students across institutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadNoteForm onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="resources">
        <Card>
          <CardHeader>
            <CardTitle>Upload New Resource</CardTitle>
            <CardDescription>
              Upload educational materials that students can access. Supported formats: PDF, DOCX, PPTX, XLSX, TXT, EPUB
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadResourceForm
              type="resource"
              uploaderId={facultyId}
              uploaderRole="faculty"
              onSuccess={handleSuccess}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
