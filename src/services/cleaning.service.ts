import { apiClient } from "./api";

export interface CleaningOperation {
  id: number;
  dataset: number;
  issue: number | null;
  operation_type: string;
  column_name: string;
  parameters: Record<string, any>;
  rows_affected: number | null;
  status: "PENDING" | "APPLIED" | "FAILED" | "REVERTED";
  applied_at: string | null;
  created_at: string;
}

export const cleaningApi = {
  async list(datasetId: number): Promise<CleaningOperation[]> {
    const res = await apiClient.get(`/cleaning/?dataset=${datasetId}`);
    return res.data;
  },
  async create(data: Partial<CleaningOperation>): Promise<CleaningOperation> {
    const res = await apiClient.post("/cleaning/", data);
    return res.data;
  },
  async revert(id: number): Promise<{ detail: string }> {
    const res = await apiClient.post(`/cleaning/${id}/revert/`);
    return res.data;
  },
  async preview(data: Partial<CleaningOperation>): Promise<any> {
    const res = await apiClient.post("/cleaning/preview/", data);
    return res.data;
  },
};
