import apiClient from '@/lib/axios';
import { tokenManager } from '@/lib/token';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface ChatMessage {
  id: number;
  session: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatSession {
  id: number;
  user: number;
  dataset: number;
  dataset_name?: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ChatSessionDetail extends ChatSession {
  messages: ChatMessage[];
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
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value, { stream: true }).split('\n')) {
        const parsed = parseSSELine(line);
        if (!parsed) continue;
        if (parsed.type === 'done') { onDone(); return; }
        if (parsed.type === 'error') { onError(new Error(parsed.message)); return; }
        onToken(parsed.data);
      }
    }
    onDone();
  } finally {
    reader.releaseLock();
  }
}

export const chatApi = {
  async listSessions(): Promise<ChatSession[]> {
    const res = await apiClient.get('chat/');
    return Array.isArray(res.data) ? res.data : (res.data.results ?? []);
  },

  async createSession(payload: { dataset_id: number; title: string }): Promise<ChatSession> {
    const res = await apiClient.post('chat/', payload);
    return res.data;
  },

  async getSession(id: number): Promise<ChatSessionDetail> {
    const res = await apiClient.get(`chat/${id}/`);
    return res.data;
  },

  async clearHistory(id: number): Promise<void> {
    await apiClient.delete(`chat/${id}/clear/`);
  },

  async sendMessageSync(id: number, message: string): Promise<ChatMessage> {
    const res = await apiClient.post(`chat/${id}/message/`, { message });
    return res.data;
  },

  async streamMessage(
    sessionId: number,
    message: string,
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (err: Error) => void
  ): Promise<void> {
    const url = `${API_BASE_URL}/api/v1/chat/${sessionId}/stream/`;
    const token = tokenManager.getAccessToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token ?? ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Stream request failed: ${response.status}`);
    }

    await consumeSSEStream(response.body, onToken, onDone, onError);
  },
};
