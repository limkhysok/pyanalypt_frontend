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
  hyperparameters: Record<string, unknown>;
  status: 'pending' | 'training' | 'completed' | 'failed';
  metrics: Record<string, number> | null;
  feature_importance: { feature: string; importance: number; importance_pct: number }[] | null;
  label_classes: string[];
  train_samples: number | null;
  test_samples: number | null;
  training_time_seconds: number | null;
  allowed_hyperparams: Record<string, string>;
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
  hyperparameters?: Record<string, unknown>;
}

export interface PredictionPayload {
  dataset_id?: number;
  data?: Record<string, unknown>[];
}

export interface PredictionItem {
  row_index: number;
  prediction: number | string;
}

export interface PredictionResponse {
  predictions: (number | string | PredictionItem)[];
  model_id?: number;
  model_name?: string;
  dataset_id?: number;
  task_type?: TaskType;
  algorithm?: string;
  feature_columns?: string[];
  target_column?: string | null;
  label_classes?: string[];
  total_rows?: number;
  predicted_rows?: number;
}

export interface Algorithm {
  id: string;   // same as the algorithm key, e.g. "linear", "ridge"
  name: string; // human-readable label
  hyperparams: Record<string, string>;
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
    // Backend returns: { "regression": [{algorithm: "linear", hyperparams: {...}}, ...] }
    const taskData: { algorithm: string; hyperparams: Record<string, string> }[] =
      res.data?.[taskType] ?? [];
    return taskData.map((item) => ({
      id: item.algorithm,
      name: item.algorithm.replaceAll('_', ' ').replaceAll(/\b\w/g, (c) => c.toUpperCase()),
      hyperparams: item.hyperparams,
    }));
  },
};
