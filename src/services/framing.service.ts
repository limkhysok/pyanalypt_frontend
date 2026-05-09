import apiClient from '@/lib/axios';
import { tokenManager } from '@/lib/token';
import { DatasetFrame } from '@/types/dataset';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const framingApi = {
  /**
   * Stream a new Problem Framing for a dataset via SSE.
   * Tokens arrive as they're generated; result is saved server-side on [DONE].
   */
  async stream(
    datasetId: number,
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (err: Error) => void
  ): Promise<void> {
    const url = `${API_BASE_URL}/api/v1/frames/run/${datasetId}/`;
    const token = tokenManager.getAccessToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token ?? ''}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok || !response.body) {
      throw new Error(`Problem Framing request failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        for (const line of text.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') { onDone(); return; }
          if (data.startsWith('[ERROR]')) { onError(new Error(data.slice(8))); return; }
          onToken(data.replaceAll(String.raw`\n`, '\n'));
        }
      }
      onDone();
    } finally {
      reader.releaseLock();
    }
  },

  /**
   * Get all saved Problem Framing results for a dataset, newest first.
   */
  async history(datasetId: number): Promise<DatasetFrame[]> {
    const response = await apiClient.get<DatasetFrame[]>(`frames/history/${datasetId}/`);
    return response.data;
  },

  /**
   * Get all Problem Framing results for the current user.
   */
  async list(): Promise<DatasetFrame[]> {
    const response = await apiClient.get<DatasetFrame[]>('frames/');
    return response.data;
  },

  /**
   * Get a single saved frame by ID.
   */
  async get(id: number): Promise<DatasetFrame> {
    const response = await apiClient.get<DatasetFrame>(`frames/${id}/`);
    return response.data;
  },
};
