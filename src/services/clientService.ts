import api from './api';



export type ClientStatus =
  | 'pending'
  | 'active'
  | 'inactive'
  | 'rejected';
export interface Client {
  client_id: number;
  user_id?: number;

  user: {
    user_id: number;
    firstname: string | null;
    middlename: string | null;
    lastname: string | null;
    fullname: string;
    email: string;
    phone: string | null;
    status: ClientStatus;
    role?: {
      role_id: number;
      role_name: string;
    } | null;
  };

  birth_date: string | null;
  barangay: string | null;
  purok: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ClientListResponse {
  success: boolean;
  message: string;

  data: {
    current_page: number;
    data: Client[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface ClientResponse {
  success: boolean;
  message: string;
  data: Client;
}

export interface CreateClientData {
  firstname?: string;
  middlename?: string | null;
  lastname?: string;
  fullname?: string;
  email: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  barangay?: string;
  purok?: string;
  password?: string;
  password_confirmation?: string;
}

interface RegistrationLocationResponse {
  success: boolean;
  data: string[];
}

export async function getRegistrationBarangays(): Promise<string[]> {
  const response = await api.get<RegistrationLocationResponse>(
    '/locations/barangays'
  );
  return response.data.data;
}

export async function getRegistrationPuroks(
  barangay: string
): Promise<string[]> {
  const response = await api.get<RegistrationLocationResponse>(
    '/locations/puroks',
    { params: { barangay } }
  );
  return response.data.data;
}

export async function getClients(
  search = '',
  page = 1,
  status?: ClientStatus
) {
  const response =
    await api.get<ClientListResponse>(
      '/admin/clients',
      {
        params: {
          search,
          page,
          per_page: 10,
          ...(status ? { status } : {}),
        },
      }
    );

  return response.data;
}
export async function getClient(
  clientId: number
) {
  const response =
    await api.get<ClientResponse>(
      `/admin/clients/${clientId}`
    );

  return response.data;
}

export async function createClient(
  data: CreateClientData
) {
  const response =
    await api.post<ClientResponse>(
      '/admin/clients',
      data
    );

  return response.data;
}

export async function updateClient(
  clientId: number,
  data: CreateClientData
) {
  const response =
    await api.put<ClientResponse>(
      `/admin/clients/${clientId}`,
      data
    );

  return response.data;
}

export async function updateClientStatus(
  clientId: number,
  status: ClientStatus
) {
  const response =
    await api.patch<ClientResponse>(
      `/admin/clients/${clientId}/status`,
      { status }
    );

  return response.data;
}
