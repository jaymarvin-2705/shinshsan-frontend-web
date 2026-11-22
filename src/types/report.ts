export interface ReportRequest {
  request_id: number;
  title: string;
  status: string;
  priority: string;
  barangay: string | null;
  created_at: string;
  client?: {
    user?: {
      fullname: string;
    } | null;
  } | null;
  category?: {
    category_name: string;
  } | null;
  assignment?: {
    technician?: {
      user?: {
        fullname: string;
      } | null;
    } | null;
  } | null;
}

export interface ReportsResponse {
  success: boolean;
  message: string;
  data: {
    summary: {
      total: number;
      completed: number;
      open: number;
      cancelled: number;
      completion_rate: number;
      average_completion_minutes: number | null;
    };
    trend: Array<{
      period: string;
      label: string;
      requests: number;
      completed: number;
    }>;
    statuses: Array<{
      status: string;
      total: number;
    }>;
    categories: Array<{
      category_id: number;
      category_name: string;
      total: number;
    }>;
    barangays: Array<{
      barangay: string;
      total: number;
    }>;
    technician_performance: Array<{
      technician_id: number;
      fullname: string;
      assigned: number;
      completed: number;
      average_rating: number | null;
    }>;
    categories_filter: Array<{
      category_id: number;
      category_name: string;
    }>;
    technicians_filter: Array<{
      technician_id: number;
      fullname: string;
    }>;
    barangays_filter: string[];
    requests: {
      current_page: number;
      data: ReportRequest[];
      last_page: number;
      total: number;
    };
  };
}

export interface ReportFilters {
  start_date: string;
  end_date: string;
  status?: string;
  category_id?: number;
  technician_id?: number;
  barangay?: string;
  page?: number;
}
