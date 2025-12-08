'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Archive, 
  ArchiveRestore, 
  Upload, 
  BookOpen,
  RefreshCw,
  Eye,
  Calendar,
  Tag,
  FileType as FileTypeIcon
} from 'lucide-react';
import { getMyResources, toggleResourceStatus } from '@/actions/library/resourceActions';
import { toast } from 'sonner';
import type { LibraryResource } from '@/types/library';
import { formatFileSize } from '@/lib/utils';
import Link from 'next/link';

interface MyResourcesManagerProps {
  facultyId: string;
}

export function MyResourcesManager({ facultyId }: MyResourcesManagerProps) {
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadMyResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facultyId]);

  const loadMyResources = async () => {
    setLoading(true);
    try {
      const result = await getMyResources(facultyId);
      
      if (result.success && result.data) {
        setResources(result.data);
      } else {
        toast.error(result.error || 'Failed to load your resources');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (resourceId: string) => {
    setActionLoading(resourceId);
    try {
      const result = await toggleResourceStatus(resourceId);
      
      if (result.success) {
        toast.success('Resource status updated');
        loadMyResources();
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = async (resource: LibraryResource) => {
    window.open(resource.fileUrl, '_blank');
  };

  // Separate active and archived resources
  const activeResources = resources.filter(r => r.status === 'active');
  const archivedResources = resources.filter(r => r.status === 'archived');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Uploads</h1>
            <p className="text-muted-foreground">Loading your resources...</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Uploads</h1>
            <p className="text-muted-foreground">
              Manage your uploaded resources ({resources.length} total)
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadMyResources}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard/faculty/library/upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload New
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeResources.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resources.reduce((sum, r) => sum + r.downloadCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Resources */}
      {activeResources.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Active Resources</h2>
            <p className="text-sm text-muted-foreground">
              These resources are visible to students
            </p>
          </div>
          <div className="grid gap-4">
            {activeResources.map((resource) => (
              <Card key={resource.resourceId}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          {resource.type === 'ebook' ? (
                            <BookOpen className="h-5 w-5 text-primary" />
                          ) : (
                            <FileText className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{resource.title}</h3>
                            <Badge variant="secondary">
                              {resource.type === 'ebook' ? 'E-Book' : 'Resource'}
                            </Badge>
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Active
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            by {resource.author}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {resource.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileTypeIcon className="h-4 w-4" />
                        <span>{resource.fileType}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{formatFileSize(resource.fileSize)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        <span>{resource.category}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(resource.uploadDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        <span>{resource.downloadCount} downloads</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {resource.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(resource)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(resource.resourceId)}
                        disabled={actionLoading === resource.resourceId}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Archived Resources */}
      {archivedResources.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Archived Resources</h2>
            <p className="text-sm text-muted-foreground">
              These resources are hidden from students
            </p>
          </div>
          <div className="grid gap-4">
            {archivedResources.map((resource) => (
              <Card key={resource.resourceId} className="opacity-60">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-muted p-2 rounded-lg">
                          {resource.type === 'ebook' ? (
                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{resource.title}</h3>
                            <Badge variant="secondary">
                              {resource.type === 'ebook' ? 'E-Book' : 'Resource'}
                            </Badge>
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              Archived
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            by {resource.author}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {resource.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileTypeIcon className="h-4 w-4" />
                        <span>{resource.fileType}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        <span>{resource.downloadCount} downloads</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(resource.resourceId)}
                        disabled={actionLoading === resource.resourceId}
                      >
                        <ArchiveRestore className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {resources.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-muted rounded-full p-6 mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Resources Yet</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              You haven&apos;t uploaded any resources yet. Start sharing your knowledge by uploading lecture notes, research papers, or study materials.
            </p>
            <Button asChild>
              <Link href="/dashboard/faculty/library/upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Resource
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
