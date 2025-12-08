"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getStudentNotices } from "@/actions/student/getStudentNotices";

interface NoticesBadgeProps {
  className?: string;
}

/**
 * Component that displays a badge with unread notices count
 * Updates in real-time based on localStorage dismissed notices
 */
export function NoticesBadge({ className }: NoticesBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadUnreadCount() {
      // Fetch all notices
      const result = await getStudentNotices();
      
      if (result.success && result.notices) {
        const noticeIds = result.notices.map(n => n.noticeId);
        
        // Get dismissed notices from localStorage
        const dismissed = localStorage.getItem("dismissedNotices");
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
    window.addEventListener("noticesDismissed", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("noticesDismissed", handleStorageChange);
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
