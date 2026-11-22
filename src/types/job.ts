export interface JobUser {
  user_id: number;
  fullname: string;
  email: string;
  phone?: string;
}

export interface JobTechnician {
  technician_id: number;
  service_area?: string;
  availability: string;
  user: JobUser;
}

export interface JobClient {
  client_id: number;
  address?: string | null;
  barangay?: string | null;
  purok?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  user: JobUser;
}

export interface JobCategory {
  category_id: number;
  category_name: string;
}

export interface JobSchedule {
  schedule_id: number;
  assignment_id: number;
  schedule_date: string;
}

export interface JobFeedback {
  feedback_id: number;
  request_id: number;
  client_id: number;
  technician_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface JobRepairRequest {
  request_id: number;
  client_id: number;
  category_id: number;
  title: string;
  description: string;
  photo?: string | null;
  priority: "low" | "medium" | "high" | "very_high";
  status: string;
  category?: JobCategory | null;
  client?: JobClient | null;
  feedback?: JobFeedback | null;
  barangay?: string | null;
  purok?: string | null;
  landmark?: string | null;
}

export interface RepairUpdate {
  update_id: number;
  assignment_id: number;
  status: string;
  remarks?: string | null;
  image?: string | null;
  created_at: string;
}

export interface Job {
  assignment_id: number;
  request_id: number;
  technician_id: number;
  assigned_at?: string | null;
  status: string;
  remarks?: string | null;
  assigned_by?: JobUser | number | null;
  schedule?: JobSchedule | null;
  repair_request: JobRepairRequest;
  technician?: JobTechnician | null;
  repair_updates: RepairUpdate[];
}

export interface JobResponse {
  success: boolean;
  message: string;
  data: Job;
}