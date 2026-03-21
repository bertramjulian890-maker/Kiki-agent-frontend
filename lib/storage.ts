import { get, set, del } from 'idb-keyval';

/**
 * 本地存储工具 (IndexedDB 版本)
 * 突破 localStorage 5MB 限制，支持大容量异步存储
 */

const STORAGE_KEYS = {
    CONVERSATIONS: 'kiki_conversations_v2', // 升级版本号，防止数据混乱
    CURRENT_CONVERSATION_ID: 'kiki_current_conversation_id_v2',
    THEME: 'theme', // 主题较小，可以继续保留在 localStorage
} as const;

// 旧的 key，用于迁移
const OLD_KEYS = {
    CONVERSATIONS: 'kiki_conversations',
    CURRENT_CONVERSATION_ID: 'kiki_current_conversation_id',
};

// ============================================
// 数据迁移逻辑 (LocalStorage -> IndexedDB)
// ============================================

async function migrateIfNeeded() {
    if (typeof window === 'undefined') return;

    const newDbData = await get(STORAGE_KEYS.CONVERSATIONS);
    if (!newDbData) {
        const oldData = localStorage.getItem(OLD_KEYS.CONVERSATIONS);
        if (oldData) {
            try {
                console.log('🚚 正在将聊天记录从 LocalStorage 迁移到 IndexedDB...');
                const parsed = JSON.parse(oldData);
                await set(STORAGE_KEYS.CONVERSATIONS, parsed);

                const oldId = localStorage.getItem(OLD_KEYS.CURRENT_CONVERSATION_ID);
                if (oldId) await set(STORAGE_KEYS.CURRENT_CONVERSATION_ID, oldId);

                // 迁移成功后清理旧数据（可选，建议稳定后再手动清理，这里先保留以防万一）
                // localStorage.removeItem(OLD_KEYS.CONVERSATIONS);
                console.log('✅ 迁移完成！');
            } catch (e) {
                console.error('迁移数据失败:', e);
            }
        }
    }
}

// ============================================
// 对话列表存储 (异步)
// ============================================

export async function saveConversations<T>(conversations: T[]): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
        await set(STORAGE_KEYS.CONVERSATIONS, conversations);
    } catch (error) {
        console.error('Failed to save conversations to IndexedDB:', error);
    }
}

export async function loadConversations<T>(): Promise<T[]> {
    if (typeof window === 'undefined') return [];
    try {
        await migrateIfNeeded(); // 加载前检查是否需要迁移
        const data = await get<T[]>(STORAGE_KEYS.CONVERSATIONS);
        if (!data) return [];

        // 转换日期字符串回 Date 对象
        return data.map((conv: any) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map((m: any) => ({
                ...m,
                createdAt: new Date(m.createdAt)
            }))
        }));
    } catch (error) {
        console.error('Failed to load conversations from IndexedDB:', error);
        return [];
    }
}

// ============================================
// 当前对话ID存储
// ============================================

export async function saveCurrentConversationId(id: string | null): Promise<void> {
    if (typeof window === 'undefined') return;
    if (id) {
        await set(STORAGE_KEYS.CURRENT_CONVERSATION_ID, id);
    } else {
        await del(STORAGE_KEYS.CURRENT_CONVERSATION_ID);
    }
}

export async function loadCurrentConversationId(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    return (await get<string>(STORAGE_KEYS.CURRENT_CONVERSATION_ID)) || null;
}

// ============================================
// 数据清理
// ============================================

export async function clearAllStorage(): Promise<void> {
    if (typeof window === 'undefined') return;
    await del(STORAGE_KEYS.CONVERSATIONS);
    await del(STORAGE_KEYS.CURRENT_CONVERSATION_ID);
}