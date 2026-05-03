import apiClient from '@/lib/axios';

export type TaskType = 'regression' | 'classification' | 'clustering';

export interface MLModel {
  id: number;
  name: string;
  dataset: number;
  dataset_name?: string;
  task_type: TaskType;
  algorithm: string;
  target_column: string | null;
  feature_columns: string[];
  hyperparameters: Record<string, any>;
  status: 'training' | 'completed' | 'failed';
  metrics: Record<string, number> | null;
  feature_importance: Record<string, number> | null;
  created_at: string;
  updated_at: string;
}

export interface TrainModelPayload {
  name: string;
  dataset: number;
  task_type: TaskType;
  algorithm: string;
  target_column?: string;
  feature_columns: string[];
  hyperparameters?: Record<string, any>;
}

export interface PredictionPayload {
  data: Record<string, any>[];
}

export interface PredictionResponse {
  predictions: any[];
}

export interface Algorithm {
  id: string;
  name: string;
  description: string;
}

export const mlStudioApi = {
  async list(): Promise<MLModel[]> {
    const res = await apiClient.get('mlstudio/');
    return Array.isArray(res.data) ? res.data : (res.data.results ?? []);
  },

  async train(payload: TrainModelPayload): Promise<MLModel> {
    const res = await apiClient.post('mlstudio/', payload);
    return res.data;
  },

  async get(id: number): Promise<MLModel> {
    const res = await apiClient.get(`mlstudio/${id}/`);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`mlstudio/${id}/`);
  },

  async predict(id: number, payload: PredictionPayload): Promise<PredictionResponse> {
    const res = await apiClient.post(`mlstudio/${id}/predict/`, payload);
    return res.data;
  },

  async getAlgorithms(taskType: TaskType): Promise<Algorithm[]> {
    const res = await apiClient.get('mlstudio/algorithms/', {
      params: { task_type: taskType },
    });
    return res.data;
  },
};
