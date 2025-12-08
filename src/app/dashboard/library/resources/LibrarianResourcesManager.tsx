'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText } from 'lucide-react';
import { UploadResourceForm } from '@/components/library/UploadResourceForm';
import { ResourcesList } from '@/components/library/ResourcesList';
interface LibrarianResourcesManagerProps {
  librarianId: string;
}

export function LibrarianResourcesManager({ librarianId }: LibrarianResourcesManagerProps) {
  const [activeTab, setActiveTab] = useState('browse');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('browse');
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="browse">
          <FileText className="h-4 w-4 mr-2" />
          Browse All Resources
        </TabsTrigger>
        <TabsTrigger value="upload">
          <Upload className="h-4 w-4 mr-2" />
          Upload E-Book
        </TabsTrigger>
      </TabsList>

      <TabsContent value="browse">
        <ResourcesList key={refreshKey} showActions role="librarian" />
      </TabsContent>

      <TabsContent value="upload">
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
              uploaderId={librarianId}
              uploaderRole="librarian"
              onSuccess={handleUploadSuccess}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
