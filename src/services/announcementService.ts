import api from "./api";

import type {
  AnnouncementResponse,
  AnnouncementListResponse,
  GetAnnouncementsParams,
  SaveAnnouncementPayload,
} from "../types/announcement";

export async function getAnnouncements(
  params: GetAnnouncementsParams = {}
): Promise<AnnouncementListResponse> {
  const response = await api.get<AnnouncementListResponse>(
    "/admin/announcements",
    { params }
  );

  return response.data;
}

function buildAnnouncementFormData(
  payload: SaveAnnouncementPayload,
  removeAttachment = false
): FormData {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("content", payload.content);
  formData.append("category", payload.category);
  formData.append("target_audience", payload.target_audience);

  if (payload.status) formData.append("status", payload.status);
  if (payload.publish_at !== undefined) {
    formData.append("publish_at", payload.publish_at ?? "");
  }
  if (payload.expires_at !== undefined) {
    formData.append("expires_at", payload.expires_at ?? "");
  }
  if (payload.attachment) formData.append("attachment", payload.attachment);
  if (removeAttachment) formData.append("remove_attachment", "1");

  return formData;
}

export async function createAnnouncement(
  payload: SaveAnnouncementPayload
): Promise<AnnouncementResponse> {
  const response = payload.attachment
    ? await api.post<AnnouncementResponse>(
        "/admin/announcements",
        buildAnnouncementFormData(payload)
      )
    : await api.post<AnnouncementResponse>("/admin/announcements", payload);

  return response.data;
}

export async function updateAnnouncement(
  announcementId: number,
  payload: SaveAnnouncementPayload,
  removeAttachment = false
): Promise<AnnouncementResponse> {
  const response = payload.attachment || removeAttachment
    ? await api.post<AnnouncementResponse>(
        `/admin/announcements/${announcementId}`,
        (() => {
          const formData = buildAnnouncementFormData(payload, removeAttachment);
          formData.append("_method", "PATCH");
          return formData;
        })()
      )
    : await api.patch<AnnouncementResponse>(
        `/admin/announcements/${announcementId}`,
        payload
      );

  return response.data;
}

export async function publishAnnouncement(
  announcementId: number
): Promise<AnnouncementResponse> {
  const response = await api.post<AnnouncementResponse>(
    `/admin/announcements/${announcementId}/publish`
  );
  return response.data;
}

export async function archiveAnnouncement(
  announcementId: number
): Promise<AnnouncementResponse> {
  const response = await api.post<AnnouncementResponse>(
    `/admin/announcements/${announcementId}/archive`
  );
  return response.data;
}

export async function deleteAnnouncement(
  announcementId: number
): Promise<void> {
  await api.delete(`/admin/announcements/${announcementId}`);
}

export async function downloadAnnouncementAttachment(
  announcementId: number
): Promise<Blob> {
  const response = await api.get<Blob>(
    `/admin/announcements/${announcementId}/attachment`,
    { responseType: "blob" }
  );
  return response.data;
}
