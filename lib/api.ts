import axios from 'axios';
import type { ChatRequest, ChatResponse, StreamChunk } from '@/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// 非流式对话
export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
        const response = await axios.post<ChatResponse>(
            `${API_BASE_URL}/chat`,
            request,
            {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
            }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return {
                success: false,
                response: '',
                conversationId: request.conversationId || '',
                error: error.response?.data?.detail || error.message,
            };
        }
        throw error;
    }
}

// 流式对话（使用 EventSource 或 fetch）
export async function* streamMessage(
    request: ChatRequest,
    signal?: AbortSignal
): AsyncGenerator<StreamChunk, void, unknown> {
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'text/event-stream',
        },
        body: JSON.stringify(request),
        signal,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('Response body is null');
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 处理 SSE 格式的数据
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);
                try {
                    const chunk: StreamChunk = JSON.parse(data);
                    yield chunk;
                } catch {
                    console.error("解析 SSE 数据失败:", data);
                }
            }
        }
    }
}