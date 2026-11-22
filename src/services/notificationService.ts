import api from "./api";
import type { OperationalNotificationResponse } from "../types/notification";

export interface GetOperationalNotificationsParams {
  page?: number;
  per_page?: number;
  read?: "all" | "unread" | "read";
  type?: string;
  priority?: string;
}

interface UnreadCountResponse {
  success: boolean;
  data: {
    unread_count: number;
  };
}

interface MarkNotificationResponse {
  success: boolean;
  message: string;
  unread_count: number;
}

export async function getOperationalNotifications(
  params: GetOperationalNotificationsParams = {}
): Promise<OperationalNotificationResponse> {
  const response = await api.get<OperationalNotificationResponse>(
    "/admin/notifications",
    { params }
  );
  return response.data;
}

export async function getOperationalUnreadCount(): Promise<number> {
  const response = await api.get<UnreadCountResponse>(
    "/admin/notifications/unread-count"
  );
  return response.data.data.unread_count;
}

export async function markOperationalNotificationRead(
  notificationId: number
): Promise<number> {
  const response = await api.patch<MarkNotificationResponse>(
    `/admin/notifications/${notificationId}/read`
  );
  return response.data.unread_count;
}

export async function markAllOperationalNotificationsRead(): Promise<number> {
  const response = await api.patch<MarkNotificationResponse>(
    "/admin/notifications/read-all"
  );
  return response.data.unread_count;
}
