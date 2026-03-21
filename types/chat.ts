// 消息角色
export type MessageRole = 'user' | 'assistant' | 'system';

// 🚀 新增：工具调用状态记录
export interface ToolCall {
    tool_name: string;
    tool_input: string;
    status: 'running' | 'completed' | 'error';
}

// 修改后的 Message 接口：增加 Agent 状态支撑
export interface Message {
    id: string;
    role: MessageRole;
    content: string;
    createdAt: Date;
    isStreaming?: boolean;
    // 🚀 高级状态字段：用于在 UI 上呈现思考和工具调用过程
    isThinking?: boolean;          // 是否正在思考
    thinkingMessage?: string;      // 思考提示词 (如 "Kiki 正在思考...")
    tools?: ToolCall[];            // Agent 工具调用链记录
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

/**
 * 🚀 核心修复：流式响应数据块 (联合类型)
 * 这样写可以消除 useStreaming.ts 中关于 "done" 或 "event" 不重叠的报错
 */
export type StreamChunk =
    | { type: 'start' }
    | { type: 'chunk'; content: string }
    | { type: 'event'; status: 'thinking' | string; message?: string }
    | { type: 'tool'; tool_name: string; tool_input: string; status: 'running' | 'completed' | 'error' }
    | { type: 'end'; fullResponse?: string }
    | { type: 'done'; fullResponse?: string } // 兼容后端可能返回的 done 标识
    | { type: 'error'; message: string };