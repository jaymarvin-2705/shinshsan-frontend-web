export type AnnouncementAudience = "clients" | "technicians" | "all";

export type AnnouncementCategory =
  | "general"
  | "maintenance"
  | "service_interruption"
  | "system_update"
  | "important_notice"
  | "promotional";

export type AnnouncementStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "archived";

export type AnnouncementSortField =
  | "created_at"
  | "publish_at"
  | "published_at"
  | "title"
  | "status";

export interface Announcement {
  announcement_id: number;
  title: string;
  content: string;
  category: AnnouncementCategory;
  target_audience: AnnouncementAudience;
  status: AnnouncementStatus;
  attachment_url: string | null;
  publish_at: string | null;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  notifications_count: number;
  creator?: {
    user_id: number;
    fullname: string;
  };
}

export interface AnnouncementSummary {
  total: number;
  published: number;
  draft: number;
  scheduled: number;
  archived: number;
}

export interface PaginatedAnnouncements {
  current_page: number;
  data: Announcement[];
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface AnnouncementListResponse {
  success: boolean;
  message: string;
  summary: AnnouncementSummary;
  data: PaginatedAnnouncements;
}

export interface AnnouncementResponse {
  success: boolean;
  message: string;
  data: Announcement;
}

export interface SaveAnnouncementPayload {
  title: string;
  content: string;
  category: AnnouncementCategory;
  target_audience: AnnouncementAudience;
  status?: "draft" | "scheduled";
  publish_at?: string | null;
  expires_at?: string | null;
  attachment?: File | null;
}

export interface GetAnnouncementsParams {
  page?: number;
  per_page?: number;
  search?: string;
  audience?: AnnouncementAudience;
  category?: AnnouncementCategory;
  status?: AnnouncementStatus;
  published_from?: string;
  published_to?: string;
  sort?: AnnouncementSortField;
  direction?: "asc" | "desc";
}
