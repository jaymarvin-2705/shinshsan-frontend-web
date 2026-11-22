import api from "./api";
import type { FeedbackListResponse } from "../types/feedback";

export interface GetFeedbackParams {
  page?: number;
  per_page?: number;
  search?: string;
  rating?: number;
  technician_id?: number;
  from_date?: string;
  to_date?: string;
}

export async function getFeedback(
  params: GetFeedbackParams = {}
): Promise<FeedbackListResponse> {
  const response = await api.get<FeedbackListResponse>("/admin/feedback", {
    params,
  });

  return response.data;
}
