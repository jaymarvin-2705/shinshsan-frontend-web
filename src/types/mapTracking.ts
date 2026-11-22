import type { RepairRequest } from "./serviceRequest";

export interface MapTechnician {
  technician_id: number;
  current_latitude: string;
  current_longitude: string;
  current_location_updated_at: string | null;
  availability: "available" | "busy" | "offline";
  service_area: string | null;
  user?: {
    fullname: string;
    email: string;
    phone: string | null;
    status: string;
  } | null;
}

export interface MapTrackingResponse {
  success: boolean;
  message: string;
  data: {
    requests: RepairRequest[];
    technicians: MapTechnician[];
    last_updated_at: string;
  };
}
