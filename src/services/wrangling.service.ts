import apiClient from '@/lib/axios';
import { WrangleOperation } from "@/types/dataset";

export const wranglingApi = {
  /**
   * Retrieves a list of all wrangle operations for a dataset.
   */
  async list(datasetId: number): Promise<WrangleOperation[]> {
    const res = await apiClient.get(`datalab/wrangle/history/${datasetId}/`);
    return res.data;
  },

  /**
   * Apply a transformation to the dataset.
   */
  async apply(datasetId: number, data: Partial<WrangleOperation>): Promise<WrangleOperation> {
    const res = await apiClient.post(`datalab/wrangle/apply/${datasetId}/`, data);
    return res.data;
  },

  /**
   * Revert a previously applied operation.
   */
  async revert(id: number): Promise<{ detail: string }> {
    const res = await apiClient.post(`datalab/wrangle/revert/${id}/`);
    return res.data;
  },

  /**
   * Preview the effect of a transformation.
   */
  async preview(data: any): Promise<any> {
    const res = await apiClient.post("datalab/wrangle/preview/", data);
    return res.data;
  },
};
