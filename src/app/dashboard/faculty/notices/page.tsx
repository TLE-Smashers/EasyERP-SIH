"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Clock, X } from "lucide-react";
import { getFacultyNotices } from "@/actions/faculty/getFacultyNotices";
import { Notice } from "@/lib/google/sheets.notices";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FacultyNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedNotices, setDismissedNotices] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem("dismissedFacultyNotices");
      return dismissed ? JSON.parse(dismissed) : [];
    }
    return [];
  });
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch notices
    async function fetchNotices() {
      const result = await getFacultyNotices();
      if (result.success && result.notices) {
        setNotices(result.notices);
      }
      setLoading(false);
    }

    fetchNotices();
  }, []);

  const handleDismiss = (noticeId: string) => {
    const updatedDismissed = [...dismissedNotices, noticeId];
    setDismissedNotices(updatedDismissed);
    localStorage.setItem("dismissedFacultyNotices", JSON.stringify(updatedDismissed));
    
    // Dispatch custom event to update badge in sidebar
    window.dispatchEvent(new Event("facultyNoticesDismissed"));
    
    // Close dialog if dismissing the currently viewed notice
    if (selectedNotice?.noticeId === noticeId) {
      setIsDialogOpen(false);
      setSelectedNotice(null);
    }
  };

  const handleNoticeClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsDialogOpen(true);
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "High":
        return "Important";
      case "Medium":
        return "Normal";
      case "Low":
        return "Info";
      default:
        return priority;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const visibleNotices = notices.filter(
    (notice) => !dismissedNotices.includes(notice.noticeId)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading notices...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notices</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest announcements and information
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">
            {visibleNotices.length} Active Notice{visibleNotices.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {visibleNotices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No active notices at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleNotices.map((notice) => (
            <Card
              key={notice.noticeId}
              className="cursor-pointer hover:shadow-lg transition-shadow relative group"
              onClick={() => handleNoticeClick(notice)}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss(notice.noticeId);
                }}
              >
                <X className="h-4 w-4" />
              </Button>

              <CardHeader className="pb-3">
                <div className="flex items-start gap-2 mb-2">
                  <div className="p-2 rounded-full bg-red-50">
                    <Bell className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="text-xs">{notice.category}</Badge>
                    </div>
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">{notice.title}</CardTitle>
                <CardDescription className="text-xs flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Published: {formatDate(notice.publishedDate)}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {notice.description}
                </p>
              </CardContent>

              {notice.priority === "High" && (
                <div className="absolute bottom-2 right-2">
                  <Badge variant="destructive" className="text-xs">
                    {getPriorityLabel(notice.priority)}
                  </Badge>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Notice Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-950 border-slate-800">
          {selectedNotice && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-8 w-8"
                onClick={() => {
                  handleDismiss(selectedNotice.noticeId);
                }}
              >
                <X className="h-4 w-4" />
              </Button>

              <DialogHeader>
                <div className="flex items-start gap-3 mb-2">
                  <div className="p-2 rounded-full bg-red-950 border border-red-800">
                    <Bell className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1 pr-8">
                    <div className="flex items-center gap-2 mb-2">
                      <DialogTitle className="text-2xl">{selectedNotice.title}</DialogTitle>
                    </div>
                    <Badge variant="outline" className="mb-2">{selectedNotice.category}</Badge>
                  </div>
                </div>
                <DialogDescription className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Published: {formatDate(selectedNotice.publishedDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Expires: {formatDate(selectedNotice.expiryDate)}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {selectedNotice.imageUrl && (
                  <div className="relative w-full h-96 rounded-md overflow-hidden bg-slate-900 border border-slate-800">
                    <Image
                      src={selectedNotice.imageUrl}
                      alt={selectedNotice.title}
                      fill
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="flex items-center justify-center h-full">
                              <div class="text-muted-foreground text-sm">Image unavailable</div>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                )}

                <div className="prose prose-sm prose-invert max-w-none">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
                    {selectedNotice.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
                  <span>Published by: {selectedNotice.publishedByName}</span>
                  {selectedNotice.priority === "High" && (
                    <Badge variant="destructive" className="text-xs">
                      {getPriorityLabel(selectedNotice.priority)}
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
