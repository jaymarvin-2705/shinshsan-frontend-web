import api from "./api";
import type { ReportFilters, ReportsResponse } from "../types/report";

export async function getReports(
  params: ReportFilters
): Promise<ReportsResponse> {
  const response = await api.get<ReportsResponse>("/admin/reports", {
    params,
  });

  return response.data;
}

export async function downloadReportsCsv(
  params: Omit<ReportFilters, "page">
): Promise<Blob> {
  const response = await api.get<Blob>("/admin/reports/export", {
    params,
    responseType: "blob",
  });

  return response.data;
}
