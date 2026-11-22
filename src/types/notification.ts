export type OperationalNotificationType =
  | "new_request"
  | "technician_assigned"
  | "status_changed"
  | "feedback_received";

export interface OperationalNotification {
  notification_id: number;
  notification_type: OperationalNotificationType;
  priority: "normal" | "medium" | "high";
  title: string;
  message: string;
  related_request_id: number | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  repair_request?: {
    request_id: number;
    title: string;
    status: string;
    client?: {
      user?: {
        fullname: string;
      } | null;
    } | null;
  } | null;
}

export interface NotificationBroadcastPayload {
  notification: OperationalNotification;
}

export interface OperationalNotificationResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: OperationalNotification[];
    last_page: number;
    total: number;
  };
  unread_count: number;
}
