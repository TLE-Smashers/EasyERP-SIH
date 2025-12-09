'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadResourceForm } from "@/components/library/UploadResourceForm";
import { UploadNoteForm } from "@/components/faculty/UploadNoteForm";
import { BookOpen, FileText, Library } from "lucide-react";
import { useRouter } from "next/navigation";

interface SharedResourcesUploadProps {
  userId: string;
  userRole: 'faculty' | 'librarian' | 'admin' | 'super-admin';
}

export function SharedResourcesUpload({ userId, userRole }: SharedResourcesUploadProps) {
  const router = useRouter();

  const handleSuccess = () => {
    // Refresh the page to show new upload
    router.refresh();
  };

  // Determine upload permissions based on role
  const canUploadEbooks = ['librarian', 'admin', 'super-admin'].includes(userRole);
  const canUploadNotes = ['faculty', 'admin', 'super-admin'].includes(userRole);
  const canUploadResources = ['faculty', 'librarian', 'admin', 'super-admin'].includes(userRole);

  return (
    <Tabs defaultValue={canUploadNotes ? "notes" : canUploadEbooks ? "ebooks" : "resources"} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        {canUploadNotes && (
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Upload Notes
          </TabsTrigger>
        )}
        {canUploadEbooks && (
          <TabsTrigger value="ebooks" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Upload E-Book
          </TabsTrigger>
        )}
        {canUploadResources && (
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            Upload Resource
          </TabsTrigger>
        )}
      </TabsList>

      {canUploadNotes && (
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
      )}

      {canUploadEbooks && (
        <TabsContent value="ebooks">
          <Card>
            <CardHeader>
              <CardTitle>Upload New E-Book</CardTitle>
              <CardDescription>
                Upload e-books for students to access. Supported formats: PDF, EPUB
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadResourceForm
                type="ebook"
                uploaderId={userId}
                uploaderRole={userRole === 'faculty' ? 'faculty' : 'librarian'}
                onSuccess={handleSuccess}
              />
            </CardContent>
          </Card>
        </TabsContent>
      )}

      {canUploadResources && (
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Resource</CardTitle>
              <CardDescription>
                Upload educational materials, research papers, and study resources for students. Supported formats: PDF, DOCX, PPTX, XLSX, TXT, EPUB
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadResourceForm
                type="resource"
                uploaderId={userId}
                uploaderRole={userRole === 'faculty' ? 'faculty' : 'librarian'}
                onSuccess={handleSuccess}
              />
            </CardContent>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  );
}
