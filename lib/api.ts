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

// 流式对话（安全且稳健的 SSE 解析）
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
        throw new Error(`HTTP 错误! 状态码: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('响应体为空 (Response body is null)');
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // 将新接收到的字节块解码并追加到缓冲区
            buffer += decoder.decode(value, { stream: true });

            // 查找完整的 SSE 消息边界（必须以两个换行符结尾）
            let boundaryIndex = buffer.indexOf('\n\n');

            while (boundaryIndex !== -1) {
                // 截取一个完整的报文块
                const completeChunk = buffer.slice(0, boundaryIndex);
                // 将缓冲区剩余的（可能是不完整的）数据保留下来
                buffer = buffer.slice(boundaryIndex + 2);

                // 解析这个完整的报文块
                const lines = completeChunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        // 兼容标准的 OpenAI 结束符
                        if (data === '[DONE]') continue;
                        if (!data) continue;

                        try {
                            const chunk: StreamChunk = JSON.parse(data);
                            yield chunk;
                        } catch (e) {
                            console.error("解析单条 SSE 数据失败，已跳过:", data, e);
                        }
                    }
                }
                // 继续检查缓冲区内是否还有完整的报文块
                boundaryIndex = buffer.indexOf('\n\n');
            }
        }
    } finally {
        // 确保读取器被正确释放
        reader.releaseLock();
    }
}