'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText } from 'lucide-react';
import { UploadResourceForm } from '@/components/library/UploadResourceForm';
import { ResourcesList } from '@/components/library/ResourcesList';

interface FacultyResourcesManagerProps {
  facultyId: string;
}

export function FacultyResourcesManager({ facultyId }: FacultyResourcesManagerProps) {
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
          Upload Resource
        </TabsTrigger>
      </TabsList>

      <TabsContent value="browse">
        <ResourcesList key={refreshKey} showActions role="faculty" />
      </TabsContent>

      <TabsContent value="upload">
        <Card>
          <CardHeader>
            <CardTitle>Upload New Resource</CardTitle>
            <CardDescription>
              Upload lecture notes, research papers, and study materials for students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadResourceForm
              type="resource"
              uploaderId={facultyId}
              uploaderRole="faculty"
              onSuccess={handleUploadSuccess}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
