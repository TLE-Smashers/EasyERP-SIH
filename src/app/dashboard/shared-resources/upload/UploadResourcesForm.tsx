'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, FileText, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UploadSharedEbookForm } from '@/components/shared-resources/UploadSharedEbookForm';
import { UploadSharedNoteForm } from '@/components/shared-resources/UploadSharedNoteForm';
import { UploadSharedVideoForm } from '@/components/shared-resources/UploadSharedVideoForm';

interface UploadResourcesFormProps {
  userId: string;
  userName: string;
  userRole: 'faculty' | 'librarian' | 'admin' | 'super-admin';
}

export function UploadResourcesForm({ userId, userName, userRole }: UploadResourcesFormProps) {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect back to browse resources after successful upload
    router.push('/dashboard/shared-resources');
  };

  return (
    <Tabs defaultValue="ebooks" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="ebooks" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Upload E-Book
        </TabsTrigger>
        <TabsTrigger value="notes" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Upload Notes
        </TabsTrigger>
        <TabsTrigger value="videos" className="flex items-center gap-2">
          <Video className="h-4 w-4" />
          Upload Video
        </TabsTrigger>
      </TabsList>

      <TabsContent value="ebooks">
        <Card>
          <CardHeader>
            <CardTitle>Upload E-Book to Shared_Ebooks</CardTitle>
            <CardDescription>
              Share e-books with students across all partner institutions via federation. Supported formats: PDF, EPUB
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadSharedEbookForm
              userId={userId}
              userName={userName}
              onSuccess={handleSuccess}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notes">
        <Card>
          <CardHeader>
            <CardTitle>Upload Notes to Shared_Notes</CardTitle>
            <CardDescription>
              Share lecture notes, study materials, and course content with students across all institutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadSharedNoteForm
              userId={userId}
              userName={userName}
              userEmail={userId}
              onSuccess={handleSuccess}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="videos">
        <Card>
          <CardHeader>
            <CardTitle>Upload Video to LibraryResources</CardTitle>
            <CardDescription>
              Upload video lectures to LibraryResources sheet. Provide YouTube or Google Drive link. Supported: MP4, WebM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadSharedVideoForm
              userId={userId}
              userName={userName}
              userRole={userRole}
              onSuccess={handleSuccess}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
