"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getFacultyNotices } from "@/actions/faculty/getFacultyNotices";

interface FacultyNoticesBadgeProps {
  className?: string;
}

/**
 * Component that displays a badge with unread faculty notices count
 * Updates in real-time based on localStorage dismissed notices
 */
export function FacultyNoticesBadge({ className }: FacultyNoticesBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadUnreadCount() {
      // Fetch all notices
      const result = await getFacultyNotices();
      
      if (result.success && result.notices) {
        const noticeIds = result.notices.map(n => n.noticeId);
        
        // Get dismissed notices from localStorage
        const dismissed = localStorage.getItem("dismissedFacultyNotices");
        const dismissedIds: string[] = dismissed ? JSON.parse(dismissed) : [];
        
        // Calculate unread count
        const unread = noticeIds.filter(id => !dismissedIds.includes(id)).length;
        setUnreadCount(unread);
      }
    }

    loadUnreadCount();

    // Listen for storage changes (when notices are dismissed)
    const handleStorageChange = () => {
      loadUnreadCount();
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Also listen for custom event from the same tab
    window.addEventListener("facultyNoticesDismissed", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("facultyNoticesDismissed", handleStorageChange);
    };
  }, []);

  if (unreadCount === 0) {
    return null;
  }

  return (
    <Badge variant="destructive" className={`ml-auto ${className}`}>
      {unreadCount}
    </Badge>
  );
}
