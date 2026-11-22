import api from "./api";
import type { RepairRequestStatus } from "../types/serviceRequest";
import type { MapTrackingResponse } from "../types/mapTracking";

export async function getMapTrackingData(
  status?: RepairRequestStatus
): Promise<MapTrackingResponse> {
  const response = await api.get<MapTrackingResponse>(
    "/admin/map-tracking",
    { params: status ? { status } : undefined }
  );

  return response.data;
}
