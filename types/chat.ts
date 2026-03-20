// 消息角色
export type MessageRole = 'user' | 'assistant' | 'system';

// 单条消息
export interface Message {
    id: string;
    role: MessageRole;
    content: string;
    createdAt: Date;
    isStreaming?: boolean;  // 是否正在流式输出
}

// 对话会话
export interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
    isPinned: boolean;
}

// API 请求
export interface ChatRequest {
    message: string;
    conversationId?: string;
}

// API 响应（非流式）
export interface ChatResponse {
    success: boolean;
    response: string;
    conversationId: string;
    error?: string;
}

// 流式响应数据块
export interface StreamChunk {
    type: 'start' | 'chunk' | 'end' | 'error';
    content?: string;
    fullResponse?: string;
    message?: string;
}