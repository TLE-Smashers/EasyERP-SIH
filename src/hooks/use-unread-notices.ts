"use client";

import { useEffect, useState } from "react";

/**
 * Hook to track unread notices count
 * Uses localStorage to persist dismissed notices
 */
export function useUnreadNotices(noticeIds: string[]) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const dismissed = localStorage.getItem("dismissedNotices");
    const dismissedIds: string[] = dismissed ? JSON.parse(dismissed) : [];
    
    // Calculate unread count (total notices - dismissed notices)
    const unread = noticeIds.filter(id => !dismissedIds.includes(id)).length;
    setUnreadCount(unread);
  }, [noticeIds]);

  const markAllAsRead = () => {
    localStorage.setItem("dismissedNotices", JSON.stringify(noticeIds));
    setUnreadCount(0);
  };

  return { unreadCount, markAllAsRead };
}
