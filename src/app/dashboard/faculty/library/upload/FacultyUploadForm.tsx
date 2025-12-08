'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadResourceForm } from '@/components/library/UploadResourceForm';
import { useRouter } from 'next/navigation';

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
  );
}
