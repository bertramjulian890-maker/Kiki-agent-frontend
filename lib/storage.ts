/**
 * 本地存储工具
 * 用于持久化对话列表和当前对话ID
 */

const STORAGE_KEYS = {
    CONVERSATIONS: 'kiki_conversations',
    CURRENT_CONVERSATION_ID: 'kiki_current_conversation_id',
    THEME: 'theme',
} as const;

// ============================================
// 对话列表存储
// ============================================

export function saveConversations<T>(conversations: T[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (error) {
        console.error('Failed to save conversations:', error);
    }
}

export function loadConversations<T>(): T[] {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
        if (!data) return [];
        const parsed = JSON.parse(data);
        // 转换日期字符串回 Date 对象
        return parsed.map((conv: T & { createdAt: string; updatedAt: string }) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
        }));
    } catch (error) {
        console.error('Failed to load conversations:', error);
        return [];
    }
}

// ============================================
// 当前对话ID存储
// ============================================

export function saveCurrentConversationId(id: string | null): void {
    if (typeof window === 'undefined') return;
    try {
        if (id) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID, id);
        } else {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID);
        }
    } catch (error) {
        console.error('Failed to save current conversation ID:', error);
    }
}

export function loadCurrentConversationId(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID);
    } catch (error) {
        console.error('Failed to load current conversation ID:', error);
        return null;
    }
}

// ============================================
// 数据导出导入（新增）
// ============================================

export function exportConversations(): string {
    if (typeof window === 'undefined') return '{}';
    try {
        return localStorage.getItem(STORAGE_KEYS.CONVERSATIONS) || '{}';
    } catch (error) {
        console.error('Failed to export conversations:', error);
        return '{}';
    }
}

export function importConversations(data: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
            localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, data);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to import conversations:', error);
        return false;
    }
}

// ============================================
// 清理函数
// ============================================

export function clearAllStorage(): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID);
    } catch (error) {
        console.error('Failed to clear storage:', error);
    }
}