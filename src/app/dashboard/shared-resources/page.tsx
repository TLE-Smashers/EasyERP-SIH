/**
 * Shared Resources Page
 * Browse ebooks and notes from all partner institutions
 */

import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Download, Eye, Building2, Star } from "lucide-react";
import { getSharedEbooks, getSharedNotes } from "@/actions/federation/getSharedResources";
import { downloadResource } from "@/actions/federation/downloadResource";

async function SharedResourcesContent() {
  // Fetch shared resources
  const [ebooksResult, notesResult] = await Promise.all([
    getSharedEbooks(),
    getSharedNotes(),
  ]);

  const ebooks = ebooksResult.success ? ebooksResult.ebooks : [];
  const notes = notesResult.success ? notesResult.notes : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Shared Resources</h1>
        <p className="text-muted-foreground mt-2">
          Browse ebooks and notes shared by partner institutions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Total Ebooks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{ebooks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Total Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{notes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Total Institutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {new Set([...ebooks.map(e => e.institutionId), ...notes.map(n => n.institutionId)]).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ebooks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ebooks">
            <BookOpen className="w-4 h-4 mr-2" />
            Ebooks ({ebooks.length})
          </TabsTrigger>
          <TabsTrigger value="notes">
            <FileText className="w-4 h-4 mr-2" />
            Notes ({notes.length})
          </TabsTrigger>
        </TabsList>

        {/* Ebooks Tab */}
        <TabsContent value="ebooks" className="space-y-4">
          {ebooks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No ebooks available yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ebooks.map((ebook) => (
                <Card key={ebook.ebookId} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {ebook.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          by {ebook.author}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full shrink-0">
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-semibold">{ebook.downloads}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3">
                    {/* Institution */}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4 mr-2" />
                      {ebook.institutionName}
                    </div>

                    {/* Subject & Category */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{ebook.category}</Badge>
                      <Badge variant="outline">{ebook.subject}</Badge>
                    </div>

                    {/* Details */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{ebook.language}</span>
                      <span>{ebook.fileSize}</span>
                    </div>

                    {/* Rating */}
                    {ebook.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{ebook.rating.toFixed(1)}</span>
                      </div>
                    )}

                    {/* Action Button */}
                    <form action={async () => {
                      'use server';
                      await downloadResource({
                        resourceType: 'ebook',
                        resourceId: ebook.ebookId,
                        resourceTitle: ebook.title,
                        ownerInstitutionId: ebook.institutionId,
                        ownerInstitutionName: ebook.institutionName,
                        action: 'download',
                      });
                    }}>
                      <Button className="w-full" type="submit">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          {notes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No notes available yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <Card key={note.noteId} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {note.title}
                        </CardTitle>
                        <CardDescription>
                          {note.subject} • {note.topic}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm font-semibold">{note.views}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full">
                          <Download className="w-4 h-4" />
                          <span className="text-sm font-semibold">{note.downloads}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3">
                    {/* Institution */}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4 mr-2" />
                      {note.institutionName}
                    </div>

                    {/* Faculty */}
                    <div className="text-sm">
                      <span className="text-muted-foreground">By:</span>{" "}
                      <span className="font-medium">{note.facultyName}</span>
                    </div>

                    {/* Course Details */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{note.course}</Badge>
                      <Badge variant="outline">Sem {note.semester}</Badge>
                    </div>

                    {/* Rating */}
                    {note.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{note.rating.toFixed(1)}</span>
                      </div>
                    )}

                    {/* File Info */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{note.fileType.toUpperCase()}</span>
                      <span>{note.fileSize}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <form action={async () => {
                        'use server';
                        await downloadResource({
                          resourceType: 'note',
                          resourceId: note.noteId,
                          resourceTitle: note.title,
                          ownerInstitutionId: note.institutionId,
                          ownerInstitutionName: note.institutionName,
                          action: 'view',
                        });
                      }} className="flex-1">
                        <Button variant="outline" className="w-full" type="submit">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </form>
                      <form action={async () => {
                        'use server';
                        await downloadResource({
                          resourceType: 'note',
                          resourceId: note.noteId,
                          resourceTitle: note.title,
                          ownerInstitutionId: note.institutionId,
                          ownerInstitutionName: note.institutionName,
                          action: 'download',
                        });
                      }} className="flex-1">
                        <Button className="w-full" type="submit">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default async function SharedResourcesPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading shared resources...</p>
          </div>
        </div>
      }>
        <SharedResourcesContent />
      </Suspense>
    </div>
  );
}
