import apiClient from '@/lib/axios';
import { tokenManager } from '@/lib/token';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface AnalysisQuestion {
  id: number;
  order: number;
  question: string;
  source: 'manual' | 'ai';
  created_at: string;
}

export interface AnalysisGoal {
  id: number;
  dataset: number;
  problem_statement: string;
  question_count: number;
  created_at: string;
  updated_at: string;
}

export interface AnalysisGoalDetail extends AnalysisGoal {
  questions: AnalysisQuestion[];
}

type SSEParsed =
  | { type: 'token'; data: string }
  | { type: 'done' }
  | { type: 'error'; message: string }
  | null;

function parseSSELine(line: string): SSEParsed {
  if (!line.startsWith('data: ')) return null;
  const data = line.slice(6).trim();
  if (!data) return null;
  if (data === '[DONE]') return { type: 'done' };
  if (data.startsWith('[ERROR]')) return { type: 'error', message: data.slice(7).trim() };
  return { type: 'token', data };
}

async function consumeSSEStream(
  body: ReadableStream<Uint8Array>,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const parsed = parseSSELine(line);
        if (!parsed) continue;
        if (parsed.type === 'done') { onDone(); return; }
        if (parsed.type === 'error') { onError(new Error(parsed.message)); return; }
        onToken(parsed.data);
      }
    }
    if (buffer) {
      const parsed = parseSSELine(buffer);
      if (parsed?.type === 'done') { onDone(); return; }
      if (parsed?.type === 'error') { onError(new Error(parsed.message)); return; }
    }
    onDone();
  } finally {
    reader.releaseLock();
  }
}

export const goalsApi = {
  async list(): Promise<AnalysisGoal[]> {
    const res = await apiClient.get('goals/');
    return Array.isArray(res.data) ? res.data : (res.data.results ?? []);
  },

  async create(payload: { dataset: number; problem_statement?: string }): Promise<AnalysisGoalDetail> {
    const res = await apiClient.post('goals/', payload);
    return res.data;
  },

  async get(id: number): Promise<AnalysisGoalDetail> {
    const res = await apiClient.get(`goals/${id}/`);
    return res.data;
  },

  async update(id: number, payload: { problem_statement?: string }): Promise<AnalysisGoal> {
    const res = await apiClient.patch(`goals/${id}/`, payload);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`goals/${id}/`);
  },

  async suggest(
    goalId: number,
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (err: Error) => void
  ): Promise<void> {
    const url = `${API_BASE_URL}/api/v1/goals/${goalId}/suggest/`;
    const token = tokenManager.getAccessToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token ?? ''}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok || !response.body) {
      throw new Error(`Suggest request failed: ${response.status}`);
    }

    await consumeSSEStream(response.body, onToken, onDone, onError);
  },

  async addQuestion(goalId: number, payload: { question: string; order?: number }): Promise<AnalysisQuestion> {
    const res = await apiClient.post(`goals/${goalId}/questions/`, payload);
    return res.data;
  },

  async updateQuestion(goalId: number, questionId: number, payload: { question?: string; order?: number }): Promise<AnalysisQuestion> {
    const res = await apiClient.patch(`goals/${goalId}/questions/${questionId}/`, payload);
    return res.data;
  },

  async deleteQuestion(goalId: number, questionId: number): Promise<void> {
    await apiClient.delete(`goals/${goalId}/questions/${questionId}/`);
  },

  async bulkDeleteQuestions(goalId: number, ids: number[]): Promise<{ deleted: number }> {
    const res = await apiClient.delete(`goals/${goalId}/questions/bulk-delete/`, { data: { ids } });
    return res.data;
  },
};
