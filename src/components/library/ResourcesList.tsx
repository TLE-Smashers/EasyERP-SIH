'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Archive, RefreshCw } from 'lucide-react';
import { getAllResources, toggleResourceStatus, incrementDownloadCount } from '@/actions/library/resourceActions';
import type { LibraryResource } from '@/types/library';
import { toast } from 'sonner';

interface ResourcesListProps {
  showActions?: boolean;
  role?: 'student' | 'librarian' | 'faculty' | 'admin';
}

export function ResourcesList({ showActions = false, role = 'student' }: ResourcesListProps) {
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const result = await getAllResources();
      if (result.success && result.data) {
        setResources(result.data);
      } else {
        toast.error('Failed to load resources');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (resourceId: string) => {
    try {
      const result = await toggleResourceStatus(resourceId);
      if (result.success) {
        toast.success('Resource status updated');
        loadResources();
      } else {
        toast.error('Failed to update status');
      }
    } finally {
      // Complete
    }
  };

  const handleDownload = async (resource: LibraryResource) => {
    try {
      await incrementDownloadCount(resource.resourceId);
      window.open(resource.fileUrl, '_blank');
      toast.success('Download started');
    } finally {
      // Complete
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={loadResources}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {resources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No resources found</p>
          </CardContent>
        </Card>
      ) : (
        resources.map((resource) => (
          <Card key={resource.resourceId}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{resource.title}</h3>
                    <Badge variant={resource.type === 'ebook' ? 'default' : 'secondary'}>
                      {resource.type === 'ebook' ? 'E-Book' : 'Resource'}
                    </Badge>
                    {resource.status === 'archived' && (
                      <Badge variant="outline">Archived</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">By {resource.author}</p>
                  <p className="text-sm">{resource.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {resource.category} • {resource.downloadCount} downloads
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(resource)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  {showActions && (role === 'librarian' || role === 'faculty') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(resource.resourceId)}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
