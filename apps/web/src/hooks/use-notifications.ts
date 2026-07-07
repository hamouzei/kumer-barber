"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import type { AdminNotifications } from "@/types";

export function useNotifications(pollIntervalMs = 30_000) {
  const [data, setData] = useState<AdminNotifications>({
    notifications: [],
    unreadCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const result = await api.get<AdminNotifications>(
        "/admin/notifications"
      );
      setData(result);
    } catch {
      // Silently fail — notification polling shouldn't break the UI
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetch, pollIntervalMs]);

  const markAsRead = useCallback(
    async (id: number) => {
      await api.patch(`/admin/notifications/${id}/read`);
      await fetch();
    },
    [fetch]
  );

  const markAllAsRead = useCallback(async () => {
    await api.patch("/admin/notifications/read-all");
    await fetch();
  }, [fetch]);

  return {
    notifications: data.notifications,
    unreadCount: data.unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh: fetch,
  };
}
