"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Calendar,
  AlertCircle,
  Loader2,
  X
} from "lucide-react";
import { getActiveNotices, type Notice } from "@/lib/google/sheets.notices";
import Image from "next/image";

interface NoticesBannerProps {
  userRole: "Students" | "Faculty";
}

export default function NoticesBanner({ userRole }: NoticesBannerProps) {
  const [notices, setNotices] = React.useState<Notice[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [dismissedNotices, setDismissedNotices] = React.useState<string[]>([]);

  React.useEffect(() => {
    loadNotices();
    // Load dismissed notices from localStorage
    const dismissed = localStorage.getItem("dismissedNotices");
    if (dismissed) {
      setDismissedNotices(JSON.parse(dismissed));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadNotices() {
    setIsLoading(true);
    try {
      const result = await getActiveNotices(userRole);
      if (result.success && result.data) {
        setNotices(result.data);
      }
    } catch (error) {
      console.error("Error loading notices:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDismiss = (noticeId: string) => {
    const updated = [...dismissedNotices, noticeId];
    setDismissedNotices(updated);
    localStorage.setItem("dismissedNotices", JSON.stringify(updated));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === "High") {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
    return <Bell className="h-5 w-5 text-blue-600" />;
  };

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "border-l-red-500";
      case "Medium":
        return "border-l-yellow-500";
      case "Low":
        return "border-l-green-500";
      default:
        return "border-l-blue-500";
    }
  };

  const visibleNotices = notices.filter(
    (notice) => !dismissedNotices.includes(notice.noticeId)
  );

  if (isLoading) {
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visibleNotices.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {visibleNotices.map((notice) => (
        <Card
          key={notice.noticeId}
          className={`border-l-4 ${getPriorityBorderColor(notice.priority)}`}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getPriorityIcon(notice.priority)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{notice.title}</CardTitle>
                    <Badge variant="outline">{notice.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Published: {formatDate(notice.publishedDate)}</span>
                    <span>•</span>
                    <span>Expires: {formatDate(notice.expiryDate)}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(notice.noticeId)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm whitespace-pre-wrap">{notice.description}</p>
            {notice.imageUrl && (
              <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                <Image
                  src={notice.imageUrl}
                  alt={notice.title}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <span>Published by: {notice.publishedByName}</span>
              {notice.priority === "High" && (
                <Badge className="bg-red-100 text-red-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Important
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
