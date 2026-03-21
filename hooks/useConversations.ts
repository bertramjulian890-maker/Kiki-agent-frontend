"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import type { Conversation, Message } from "@/types/chat";
import {
    saveConversations,
    loadConversations,
    saveCurrentConversationId,
    loadCurrentConversationId,
} from "@/lib/storage";
import { debounce } from "@/lib/utils";

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function generateTitle(messages: Message[]): string {
    if (messages.length === 0) return "新对话";
    const firstUserMessage = messages.find((m) => m.role === "user");
    if (!firstUserMessage) return "新对话";
    const content = firstUserMessage.content.slice(0, 20);
    return content.length >= 20 ? `${content}...` : content;
}

const debouncedSaveConversations = debounce(saveConversations, 500);

export function useConversations() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initStorage = async () => {
            setIsLoading(true);
            const loaded = await loadConversations<Conversation>();
            const currentId = await loadCurrentConversationId();

            const loadedClean = loaded.filter(c => c.messages.length > 0);
            
            const newId = generateId();
            const newConv: Conversation = {
                id: newId,
                title: "新对话",
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isPinned: false,
            };

            setConversations([newConv, ...loadedClean]);
            setCurrentConversationId(newId);
            
            // 立刻覆盖保存一次，防止刷新带来无用的空对话堆积
            await saveConversations([newConv, ...loadedClean]);
            await saveCurrentConversationId(newId);
            setIsLoading(false);
        };
        initStorage();
    }, []);

    // 🚀 新增 ref 拦截首次渲染
    const isFirstLoad = useRef(true);

    useEffect(() => {
        if (isLoading) return;

        // 如果是第一次加载完成，跳过保存，只把标记设为 false
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }

        if (conversations.length > 0) {
            debouncedSaveConversations(conversations);
        }
    }, [conversations, isLoading]);

    useEffect(() => {
        if (!isLoading) {
            saveCurrentConversationId(currentConversationId);
        }
    }, [currentConversationId, isLoading]);

    const createConversation = useCallback(() => {
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

    const switchConversation = useCallback((id: string) => {
        setCurrentConversationId(id);
    }, []);

    const deleteConversation = useCallback((id: string) => {
        const filtered = conversations.filter((conv) => conv.id !== id);
        
        if (filtered.length === 0) {
            const newId = generateId();
            const newConv: Conversation = { 
                id: newId, 
                title: "新对话", 
                messages: [], 
                createdAt: new Date(), 
                updatedAt: new Date(), 
                isPinned: false 
            };
            setConversations([newConv]);
            setCurrentConversationId(newId);
        } else {
            setConversations(filtered);
            if (currentConversationId === id) {
                setCurrentConversationId(filtered[0].id);
            }
        }
    }, [conversations, currentConversationId]);

    const updateConversationMessages = useCallback(
        (id: string, messages: Message[]) => {
            setConversations((prev) =>
                prev.map((conv) => {
                    if (conv.id !== id) return conv;
                    const title = conv.title === "新对话" && messages.length > 0
                        ? generateTitle(messages)
                        : conv.title;
                    return { ...conv, messages, title, updatedAt: new Date() };
                })
            );
        },
        []
    );

    const renameConversation = useCallback((id: string, title: string) => {
        setConversations((prev) =>
            prev.map((conv) => conv.id === id ? { ...conv, title, updatedAt: new Date() } : conv)
        );
    }, []);

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

    // 🚀 新增的复制对话功能
    const duplicateConversation = useCallback((id: string) => {
        setConversations((prev) => {
            const source = prev.find((c) => c.id === id);
            if (!source) return prev;

            const newId = generateId();
            const newConv = {
                ...source,
                id: newId,
                title: `${source.title} (副本)`,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            setCurrentConversationId(newId);
            return [newConv, ...prev];
        });
    }, []);

    // 🚀 新增的导出功能
    const exportConversations = useCallback(() => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(conversations));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "kiki_conversations.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }, [conversations]);

    const currentConversation = conversations.find((conv) => conv.id === currentConversationId) || null;

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
        duplicateConversation, // 👈 在这里返回它！
        exportConversations,   // 👈 在这里返回它！
    };
}