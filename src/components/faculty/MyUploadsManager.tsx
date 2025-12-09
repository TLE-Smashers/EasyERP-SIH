'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Upload, 
  BookOpen,
  RefreshCw,
  Eye,
  Calendar,
  Tag,
  Trash2
} from 'lucide-react';
import { getMyResources } from '@/actions/library/resourceActions';
import { fetchMyNotes, deleteFacultyNote, recordNoteDownload } from '@/actions/faculty/noteActions';
import { toast } from 'sonner';
import type { LibraryResource } from '@/types/library';
import type { SharedNote } from '@/types/federation';
import { formatFileSize } from '@/lib/utils';
import Link from 'next/link';

interface MyUploadsManagerProps {
  facultyId: string;
}

export function MyUploadsManager({ facultyId }: MyUploadsManagerProps) {
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadMyUploads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facultyId]);

  const loadMyUploads = async () => {
    setLoading(true);
    try {
      // Load both resources and notes
      const [resourcesResult, notesResult] = await Promise.all([
        getMyResources(facultyId),
        fetchMyNotes()
      ]);
      
      if (resourcesResult.success && resourcesResult.data) {
        setResources(resourcesResult.data);
      }
      
      if (notesResult.success && notesResult.data) {
        setNotes(notesResult.data);
      }
    } catch (error) {
      toast.error('Failed to load uploads');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    setActionLoading(noteId);
    try {
      const result = await deleteFacultyNote(noteId);
      
      if (result.success) {
        toast.success('Note deleted successfully');
        loadMyUploads();
      } else {
        toast.error(result.error || 'Failed to delete note');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadNote = async (note: SharedNote) => {
    window.open(note.fileUrl, '_blank');
    await recordNoteDownload(note.noteId);
  };

  const handleDownloadResource = async (resource: LibraryResource) => {
    window.open(resource.fileUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Uploads</h1>
            <p className="text-muted-foreground">Loading your uploads...</p>
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

  const activeResources = resources.filter(r => r.status === 'active');
  const activeNotes = notes.filter(n => n.isActive);

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
              {activeNotes.length} notes • {activeResources.length} resources
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadMyUploads} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/dashboard/faculty/library/upload">
            <Button size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload New
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeNotes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeResources.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeNotes.reduce((sum, n) => sum + n.downloads, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeNotes.reduce((sum, n) => sum + n.views, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Notes and Resources */}
      <Tabs defaultValue="notes" className="w-full">
        <TabsList>
          <TabsTrigger value="notes">
            <FileText className="h-4 w-4 mr-2" />
            My Notes ({activeNotes.length})
          </TabsTrigger>
          <TabsTrigger value="resources">
            <BookOpen className="h-4 w-4 mr-2" />
            My Resources ({activeResources.length})
          </TabsTrigger>
        </TabsList>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          {activeNotes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notes uploaded yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start sharing your lecture notes and study materials with students
                </p>
                <Link href="/dashboard/faculty/library/upload">
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Note
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            activeNotes.map((note) => (
              <Card key={note.noteId}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{note.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {note.subject} • {note.topic}
                          </p>
                        </div>
                      </div>

                      {note.description && (
                        <p className="text-sm text-muted-foreground pl-11">
                          {note.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 pl-11">
                        <Badge variant="secondary">{note.course}</Badge>
                        <Badge variant="outline">Semester {note.semester}</Badge>
                        {note.branch && <Badge variant="outline">{note.branch}</Badge>}
                        <Badge variant="outline" className="capitalize">
                          {note.fileType}
                        </Badge>
                        {note.fileSize && <Badge variant="outline">{note.fileSize}</Badge>}
                      </div>

                      {note.tags && note.tags.length > 0 && (
                        <div className="flex items-center gap-2 pl-11 text-sm text-muted-foreground">
                          <Tag className="h-3 w-3" />
                          {note.tags.join(', ')}
                        </div>
                      )}

                      <div className="flex items-center gap-4 pl-11 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {note.downloads}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {note.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(note.uploadDate).toLocaleDateString()}
                        </div>
                        {note.academicYear && (
                          <Badge variant="outline" className="text-xs">
                            {note.academicYear}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadNote(note)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteNote(note.noteId)}
                        disabled={actionLoading === note.noteId}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          {activeResources.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No resources uploaded yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Upload educational materials for students
                </p>
                <Link href="/dashboard/faculty/library/upload">
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resource
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            activeResources.map((resource) => (
              <Card key={resource.resourceId}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{resource.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            by {resource.author}
                          </p>
                        </div>
                      </div>

                      {resource.description && (
                        <p className="text-sm text-muted-foreground pl-11">
                          {resource.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 pl-11">
                        <Badge variant="secondary">{resource.category}</Badge>
                        <Badge variant="outline" className="uppercase">
                          {resource.fileType}
                        </Badge>
                        <Badge variant="outline">
                          {formatFileSize(resource.fileSize)}
                        </Badge>
                      </div>

                      {resource.tags && resource.tags.length > 0 && (
                        <div className="flex items-center gap-2 pl-11 text-sm text-muted-foreground">
                          <Tag className="h-3 w-3" />
                          {resource.tags.join(', ')}
                        </div>
                      )}

                      <div className="flex items-center gap-4 pl-11 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {resource.downloadCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(resource.uploadDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadResource(resource)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
