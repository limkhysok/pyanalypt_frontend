import apiClient from '@/lib/axios';
import axios from 'axios';
export type {
  Dataset,
  RenameDatasetRequest,
  DuplicateDatasetRequest,
  DatasetExportFormat,
  DatasetActivityLog,
  PaginatedResponse,
} from '@/types/dataset';

import type {
  Dataset,
  RenameDatasetRequest,
  DuplicateDatasetRequest,
  DatasetExportFormat,
  DatasetActivityLog,
  PaginatedResponse,
} from '@/types/dataset';

export const datasetApi = {
  /**
   * Retrieves a list of all datasets owned by the authenticated user.
   */
  async listDatasets(): Promise<PaginatedResponse<Dataset>> {
    const response = await apiClient.get<PaginatedResponse<Dataset>>('datasets/');
    return response.data;
  },

  /**
   * Rename dataset display file name.
   */
  async renameDataset(id: number, data: RenameDatasetRequest): Promise<Dataset> {
    const response = await apiClient.patch<Dataset>(`datasets/${id}/rename/`, data);
    return response.data;
  },

  /**
   * Permanently delete a dataset and its physical file.
   */
  async deleteDataset(id: number): Promise<void> {
    await apiClient.delete(`datasets/${id}/`);
  },
  
  /**
   * Clone a dataset into a new record.
   */
  async duplicateDataset(id: number, data: DuplicateDatasetRequest): Promise<Dataset> {
    const response = await apiClient.post<Dataset>(`datasets/${id}/duplicate/`, data);
    return response.data;
  },

  /**
   * Standard multipart/form-data upload using your system's file picker.
   */
  async uploadDataset(file: File): Promise<Dataset> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<Dataset>('datasets/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Download dataset file in a requested export format.
   */
  async exportDataset(id: number, format?: DatasetExportFormat): Promise<{ blob: Blob; filename: string | null; contentType: string | null }> {
    const requestedFormat = format?.toLowerCase();

    try {
      const response = await apiClient.get<Blob>(`datasets/${id}/export/`, {
        params: requestedFormat ? { format: requestedFormat } : undefined,
        responseType: 'blob',
      });

      const disposition = response.headers['content-disposition'] as string | undefined;
      const filenameMatch = disposition?.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
      const filename = filenameMatch?.[1] || filenameMatch?.[2] || null;
      const contentType = (response.headers['content-type'] as string | undefined) ?? null;

      return {
        blob: response.data,
        filename,
        contentType,
        };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Export endpoint not found for format: ${requestedFormat ?? 'default'}`);
      }
      throw error;
    }
  },

  /**
   * List all activity logs for the current user's datasets.
   */
  async listActivityLogs(datasetId?: number): Promise<PaginatedResponse<DatasetActivityLog>> {
    const response = await apiClient.get<PaginatedResponse<DatasetActivityLog>>('datasets/activity_logs/', {
      params: datasetId ? { dataset_id: datasetId } : undefined,
    });
    return response.data;
  },

};

