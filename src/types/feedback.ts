export interface FeedbackRepairRequest {
  request_id: number;
  title: string;
  description: string;
  status: string;
  category?: {
    category_name: string;
  } | null;
}

export interface FeedbackRecord {
  feedback_id: number;
  request_id: number;
  client_id: number;
  technician_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  repair_request?: FeedbackRepairRequest | null;
  client?: {
    user?: {
      fullname: string;
      email: string;
      phone: string | null;
    } | null;
  } | null;
  technician?: {
    user?: {
      fullname: string;
      email: string;
      phone: string | null;
    } | null;
  } | null;
}

export interface FeedbackTechnicianOption {
  technician_id: number;
  fullname: string;
}

export interface FeedbackListResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: FeedbackRecord[];
    last_page: number;
    per_page: number;
    total: number;
  };
  summary: {
    total: number;
    average_rating: number;
    rating_counts: Record<number, number>;
  };
  technicians: FeedbackTechnicianOption[];
}
