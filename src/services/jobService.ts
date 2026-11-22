import api from "./api";
import type { JobResponse } from "../types/job";

export const getJobs = async (params = {}) => {
  const response = await api.get("/admin/jobs", {
    params,
  });

  return response.data;
};

export const getJob = async (assignmentId: number): Promise<JobResponse> => {
  const response = await api.get<JobResponse>(
    `/admin/jobs/${assignmentId}`
  );

  return response.data;
};