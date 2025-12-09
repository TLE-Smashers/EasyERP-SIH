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
    <div className="space-y-6">
      <Tabs defaultValue="ebooks" className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground w-auto">
          <TabsTrigger value="ebooks" className="inline-flex items-center gap-2 px-4">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Upload E-Book</span>
            <span className="sm:hidden">E-Book</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="inline-flex items-center gap-2 px-4">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Upload Notes</span>
            <span className="sm:hidden">Notes</span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="inline-flex items-center gap-2 px-4">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Upload Video</span>
            <span className="sm:hidden">Video</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ebooks" className="mt-6">
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

      <TabsContent value="notes" className="mt-6">
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

      <TabsContent value="videos" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Video to SharedVideos</CardTitle>
            <CardDescription>
              Upload video lectures to federation. Provide YouTube or Google Drive link. Supported: MP4, WebM
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
    </div>
  );
}
