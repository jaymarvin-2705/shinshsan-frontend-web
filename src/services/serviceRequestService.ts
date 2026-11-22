import api from "./api";

import type {
  RepairRequestListResponse,
  RepairRequestPriority,
  RepairRequestResponse,
} from "../types/serviceRequest";

interface GetRepairRequestsParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  priority?: string;
}

export const getRepairRequests = async (
  params: GetRepairRequestsParams = {}
): Promise<RepairRequestListResponse> => {
  const response = await api.get<RepairRequestListResponse>(
    "/admin/repair-requests",
    {
      params,
    }
  );

  return response.data;
};

export const getRepairRequest = async (
  requestId: number
): Promise<RepairRequestResponse> => {
  const response = await api.get<RepairRequestResponse>(
    `/admin/repair-requests/${requestId}`
  );

  return response.data;
};

export const updateRepairRequestPriority = async (
  requestId: number,
  priority: Exclude<RepairRequestPriority, "low">
): Promise<RepairRequestResponse> => {
  const response = await api.patch<RepairRequestResponse>(
    `/admin/repair-requests/${requestId}/priority`,
    { priority }
  );

  return response.data;
};

export const assignTechnician = async (
  requestId: number,
  technicianId: number
) => {
  const response = await api.post(
    `/admin/repair-requests/${requestId}/assign`,
    {
      technician_id: technicianId,
    }
  );

  return response.data;
};

export const autoAssignTechnician = async (
  requestId: number
) => {
  const response = await api.post(
    `/admin/repair-requests/${requestId}/auto-assign`
  );

  return response.data;
};