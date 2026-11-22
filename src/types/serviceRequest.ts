export type RepairRequestStatus =
  | "pending"
  | "assigned"
  | "on_the_way"
  | "in_progress"
  | "completed"
  | "cancelled";

export type RepairRequestPriority =
  | "low"
  | "medium"
  | "high"
  | "very_high";

export interface IssueCategory {
  category_id: number;
  category_name: string;
  description?: string | null;
}

export interface ClientUser {
  user_id: number;
  fullname: string;
  email: string;
  phone: string;
  status: string;
}

export interface ClientProfile {
  client_id: number;
  user_id: number;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  user?: ClientUser;
}

export interface TechnicianUser {
  user_id: number;
  fullname: string;
  email: string;
  phone: string;
  status: string;
}

export interface Technician {
  technician_id: number;
  user_id: number;
  service_area: string | null;
  availability: "available" | "busy" | "offline";
  current_latitude: string | null;
  current_longitude: string | null;
  user?: TechnicianUser;
}

export interface JobAssignment {
  assignment_id: number;
  request_id: number;
  technician_id: number;
  assigned_by: number | null;
  assigned_at: string | null;
  status:
    | "assigned"
    | "accepted"
    | "rejected"
    | "on_the_way"
    | "in_progress"
    | "completed"
    | "cancelled";
  remarks: string | null;

  technician?: Technician;
}

export interface RepairRequest {
  request_id: number;
  client_id: number;
  category_id: number;

  title: string;
  description: string;
  barangay?: string | null;
  purok?: string | null;
  landmark?: string | null;
  photo: string | null;

  priority: RepairRequestPriority;
  status: RepairRequestStatus;

  created_at: string;
  updated_at: string;
  service_latitude?: string | null;
  service_longitude?: string | null;

  category?: IssueCategory;
  client?: ClientProfile;
  assignment?: JobAssignment | null;
}

export interface PaginatedRepairRequests {
  current_page: number;
  data: RepairRequest[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface RepairRequestResponse {
  success: boolean;
  message: string;
  data: RepairRequest;
}

export interface RepairRequestListResponse {
  success: boolean;
  message: string;
  data: PaginatedRepairRequests;
}