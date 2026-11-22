import api from './api';

export interface Technician {
  technician_id: number;

  user: {
    user_id: number;
    fullname: string;
    email: string;
    phone: string | null;
    status: string;
  };

  service_area: string | null;

  availability:
    | 'available'
    | 'busy'
    | 'offline';

  current_latitude: string | null;
  current_longitude: string | null;
}

export interface TechnicianListResponse {
  success: boolean;
  message: string;

  data: {
    current_page: number;
    data: Technician[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface TechnicianResponse {
  success: boolean;
  message: string;
  data: Technician;
}

export interface CreateTechnicianData {
  fullname: string;
  email: string;
  phone?: string;
  service_area?: string;
  availability?:
    | 'available'
    | 'busy'
    | 'offline';
}

export async function getTechnicians(
  search = '',
  page = 1,
  perPage = 10
) {
  const response =
    await api.get<TechnicianListResponse>(
      '/admin/technicians',
      {
        params: {
          search,
          page,
          per_page: perPage,
        },
      }
    );

  return response.data;
}

export async function getTechnician(
  technicianId: number
) {
  const response =
    await api.get<TechnicianResponse>(
      `/admin/technicians/${technicianId}`
    );

  return response.data;
}

export async function createTechnician(
  data: CreateTechnicianData
) {
  const response =
    await api.post<TechnicianResponse>(
      '/admin/technicians',
      data
    );

  return response.data;
}

export async function updateTechnician(
  technicianId: number,
  data: CreateTechnicianData
) {
  const response =
    await api.put<TechnicianResponse>(
      `/admin/technicians/${technicianId}`,
      data
    );

  return response.data;
}

export async function updateTechnicianStatus(
  technicianId: number,
  status: 'active' | 'inactive'
) {
  const response =
    await api.patch<TechnicianResponse>(
      `/admin/technicians/${technicianId}/status`,
      { status }
    );

  return response.data;
}

export async function updateTechnicianAvailability(
  technicianId: number,
  availability:
    | 'available'
    | 'busy'
    | 'offline'
) {
  const response =
    await api.patch<TechnicianResponse>(
      `/admin/technicians/${technicianId}/availability`,
      { availability }
    );

  return response.data;
}