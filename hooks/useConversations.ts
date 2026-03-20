"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import type { Conversation, Message } from "@/types/chat";
import {
    saveConversations,
    loadConversations,
    saveCurrentConversationId,
    loadCurrentConversationId,
    exportConversations,
    importConversations,
} from "@/lib/storage";
import { debounce, downloadJSON, readJSONFile } from "@/lib/utils";

// 生成唯一ID
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// 生成对话标题（基于第一条消息）
function generateTitle(messages: Message[]): string {
    if (messages.length === 0) return "新对话";
    const firstUserMessage = messages.find((m) => m.role === "user");
    if (!firstUserMessage) return "新对话";
    // 截取前20个字符
    const content = firstUserMessage.content.slice(0, 20);
    return content.length >= 20 ? `${content}...` : content;
}

// 防抖保存到本地存储（延迟 500ms）
const debouncedSaveConversations = debounce(saveConversations, 500);

export interface UseConversationsReturn {
    // 对话列表
    conversations: Conversation[];
    // 当前选中的对话
    currentConversation: Conversation | null;
    // 是否加载中
    isLoading: boolean;
    // 创建新对话
    createConversation: () => string;
    // 切换对话
    switchConversation: (id: string) => void;
    // 删除对话
    deleteConversation: (id: string) => void;
    // 更新对话消息
    updateConversationMessages: (id: string, messages: Message[]) => void;
    // 重命名对话
    renameConversation: (id: string, title: string) => void;
    // 切换对话置顶状态
    togglePinConversation: (id: string) => void;
    // 复制对话
    duplicateConversation: (id: string) => string;
    // 删除单条消息
    deleteMessage: (conversationId: string, messageIndex: number) => void;
    // 重新生成消息
    regenerateMessage: (conversationId: string, messageIndex: number) => void;
    // 清空所有对话
    clearAllConversations: () => void;
    // 导出对话数据
    exportConversations: () => void;
    // 导入对话数据
    importConversations: (file: File) => Promise<boolean>;
    // 获取导出数据（用于备份）
    getExportData: () => string;
}

export function useConversations(): UseConversationsReturn {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 从本地存储加载
    useEffect(() => {
        const loaded = loadConversations<Conversation>();
        const currentId = loadCurrentConversationId();
        setConversations(loaded);
        setCurrentConversationId(currentId);
        setIsLoading(false);
    }, []);

    // 空白状态兜底：如果加载后列表为空，创建一个新对话
    useEffect(() => {
        if (!isLoading && conversations.length === 0) {
            const newId = generateId();
            const newConversation: Conversation = {
                id: newId,
                title: "新对话",
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isPinned: false,
            };
            setConversations([newConversation]);
            setCurrentConversationId(newId);
        }
    }, [isLoading, conversations.length]);

    // 防抖保存到本地存储（避免高频 I/O）
    useEffect(() => {
        if (!isLoading && conversations.length > 0) {
            debouncedSaveConversations(conversations);
        }
    }, [conversations, isLoading]);

    useEffect(() => {
        if (!isLoading && currentConversationId) {
            saveCurrentConversationId(currentConversationId);
        }
    }, [currentConversationId, isLoading]);

    // 创建新对话
    const createConversation = useCallback((): string => {
        const id = generateId();
        const newConversation: Conversation = {
            id,
            title: "新对话",
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            isPinned: false,
        };
        setConversations((prev) => [newConversation, ...prev]);
        setCurrentConversationId(id);
        return id;
    }, []);

    // 切换对话
    const switchConversation = useCallback((id: string) => {
        setCurrentConversationId(id);
    }, []);

    // 删除对话（修复闭包陷阱，使用 prev 状态）
    const deleteConversation = useCallback((id: string) => {
        setConversations((prevConversations) => {
            const filtered = prevConversations.filter((conv) => conv.id !== id);
            // 如果删除的是当前对话，切换到其他对话
            if (filtered.length > 0 && currentConversationId === id) {
                setCurrentConversationId(filtered[0].id);
            }
            return filtered;
        });
    }, [currentConversationId]);

    // 更新对话消息
    const updateConversationMessages = useCallback(
        (id: string, messages: Message[]) => {
            setConversations((prev) =>
                prev.map((conv) => {
                    if (conv.id !== id) return conv;
                    // 如果有新消息，更新标题
                    const title =
                        conv.title === "新对话" && messages.length > 0
                            ? generateTitle(messages)
                            : conv.title;
                    return {
                        ...conv,
                        messages,
                        title,
                        updatedAt: new Date(),
                    };
                })
            );
        },
        []
    );

    // 重命名对话
    const renameConversation = useCallback((id: string, title: string) => {
        setConversations((prev) =>
            prev.map((conv) =>
                conv.id === id ? { ...conv, title, updatedAt: new Date() } : conv
            )
        );
    }, []);

    // 切换对话置顶状态
    const togglePinConversation = useCallback((id: string) => {
        setConversations((prev) => {
            const updated = prev.map((conv) =>
                conv.id === id ? { ...conv, isPinned: !conv.isPinned, updatedAt: new Date() } : conv
            );
            return updated.sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return b.updatedAt.getTime() - a.updatedAt.getTime();
            });
        });
    }, []);

    // 复制对话
    const duplicateConversation = useCallback((id: string) => {
        const conversation = conversations.find((conv) => conv.id === id);
        if (!conversation) return '';

        const newId = generateId();
        const newConversation: Conversation = {
            ...conversation,
            id: newId,
            title: `${conversation.title} (副本)`,
            createdAt: new Date(),
            updatedAt: new Date(),
            isPinned: false,
        };

        setConversations((prev) => [newConversation, ...prev]);
        return newId;
    }, [conversations]);

    // 删除单条消息
    const deleteMessage = useCallback((conversationId: string, messageIndex: number) => {
        setConversations((prev) =>
            prev.map((conv) => {
                if (conv.id !== conversationId) return conv;
                const newMessages = [...conv.messages];
                newMessages.splice(messageIndex, 1);
                return {
                    ...conv,
                    messages: newMessages,
                    updatedAt: new Date(),
                };
            })
        );
    }, []);

    // 重新生成消息
    const regenerateMessage = useCallback((conversationId: string, messageIndex: number) => {
        setConversations((prev) =>
            prev.map((conv) => {
                if (conv.id !== conversationId) return conv;
                const newMessages = conv.messages.slice(0, messageIndex);
                return {
                    ...conv,
                    messages: newMessages,
                    updatedAt: new Date(),
                };
            })
        );
    }, []);

    // 清空所有对话
    const clearAllConversations = useCallback(() => {
        setConversations([]);
        setCurrentConversationId(null);
    }, []);

    // 导出对话数据
    const exportConversationsCallback = useCallback(() => {
        try {
            const data = JSON.parse(getExportData());
            const filename = `kiki-conversations-${new Date().toISOString().split('T')[0]}.json`;
            downloadJSON(data, filename);
        } catch (error) {
            console.error('Failed to export conversations:', error);
        }
    }, []);

    // 导入对话数据
    const importConversationsCallback = useCallback(async (file: File) => {
        try {
            const data = await readJSONFile(file);
            if (Array.isArray(data)) {
                setConversations(data);
                if (data.length > 0 && !currentConversationId) {
                    setCurrentConversationId(data[0].id);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to import conversations:', error);
            return false;
        }
    }, [currentConversationId]);

    // 获取导出数据
    const getExportData = useCallback(() => {
        return exportConversations();
    }, []);

    // 当前选中的对话
    const currentConversation =
        conversations.find((conv) => conv.id === currentConversationId) || null;

    return {
        conversations,
        currentConversation,
        isLoading,
        createConversation,
        switchConversation,
        deleteConversation,
        updateConversationMessages,
        renameConversation,
        togglePinConversation,
        duplicateConversation,
        deleteMessage,
        regenerateMessage,
        clearAllConversations,
        exportConversations: exportConversationsCallback,
        importConversations: importConversationsCallback,
        getExportData,
    };
}