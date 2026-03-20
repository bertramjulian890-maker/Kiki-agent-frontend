"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { streamMessage } from "@/lib/api";
import { useStreaming } from "./useStreaming";
import type { Message } from "@/types/chat";

function uid() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface UseChatProps {
    conversationId?: string;
    initialMessages?: Message[];
}

export function useChat({ conversationId, initialMessages = [] }: UseChatProps = {}) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastInput, setLastInput] = useState("");
    const { consume, startAbort, cancel } = useStreaming();

    useEffect(() => {
        setMessages(initialMessages);
        setError(null);
    }, [conversationId]);

    const stop = useCallback(() => {
        cancel();
        setIsLoading(false);
        // 将最后一条消息的 isStreaming 设为 false
        setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.isStreaming) {
                return prev.map((m, idx) =>
                    idx === prev.length - 1 ? { ...m, isStreaming: false } : m
                );
            }
            return prev;
        });
    }, [cancel]);

    const send = useCallback(
        async (input: string, isRegenerate = false) => {
            const text = input.trim();
            if (!text || isLoading) return;

            setError(null);
            setLastInput(text);
            setIsLoading(true);

            // 启动新的 AbortController
            const signal = startAbort();

            const userMessage: Message = {
                id: uid(),
                role: "user",
                content: text,
                createdAt: new Date(),
            };

            const assistantId = uid();
            const assistantPlaceholder: Message = {
                id: assistantId,
                role: "assistant",
                content: "",
                createdAt: new Date(),
                isStreaming: true,
            };

            if (isRegenerate) {
                setMessages((prev) => [...prev, assistantPlaceholder]);
            } else {
                setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
            }

            try {
                await consume(streamMessage({ message: text, conversationId }, signal), {
                    onChunk: (piece) => {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === assistantId ? { ...m, content: m.content + piece } : m
                            )
                        );
                    },
                    onEnd: (finalText) => {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === assistantId
                                    ? { ...m, content: finalText || m.content, isStreaming: false }
                                    : m
                            )
                        );
                        setIsLoading(false);
                    },
                    onError: (message) => {
                        setError(message);
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === assistantId ? { ...m, isStreaming: false } : m
                            )
                        );
                        setIsLoading(false);
                    },
                });
            } catch (e) {
                // 如果是主动取消，不报错
                if (e instanceof DOMException && e.name === "AbortError") {
                    console.log("流式输出已取消");
                    return;
                }
                setError(e instanceof Error ? e.message : "发送失败");
                setIsLoading(false);
                setMessages((prev) =>
                    prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m))
                );
            }
        },
        [consume, conversationId, isLoading, startAbort]
    );

    const resetConversation = useCallback(() => {
        setMessages([]);
        setError(null);
        setLastInput("");
    }, []);

    const retryLastMessage = useCallback(async () => {
        if (!lastInput) return;
        await send(lastInput);
    }, [lastInput, send]);

    const deleteMessage = useCallback((messageToDelete: Message) => {
        setMessages((prev) => prev.filter((m) => m.id !== messageToDelete.id));
    }, []);

    const regenerateMessage = useCallback(async (messageToRegenerate: Message) => {
        const index = messages.findIndex((m) => m.id === messageToRegenerate.id);
        if (index <= 0) return;

        const previousUserMessage = messages[index - 1];
        if (previousUserMessage.role !== "user") return;

        setMessages((prev) => prev.filter((m) => m.id !== messageToRegenerate.id));
        await send(previousUserMessage.content, true);
    }, [messages, send]);

    const editMessage = useCallback(async (messageToEdit: Message, newContent: string) => {
        // 1. 找到要编辑的消息
        const index = messages.findIndex((m) => m.id === messageToEdit.id);
        if (index === -1) return;

        // 2. 更新消息内容
        setMessages((prev) =>
            prev.map((m, idx) =>
                idx === index ? { ...m, content: newContent } : m
            )
        );

        // 3. 如果是用户消息，重新生成 AI 回复
        if (messageToEdit.role === "user") {
            // 删除该用户消息之后的所有消息
            const nextMessages = messages.slice(index + 1);
            if (nextMessages.length > 0) {
                setMessages((prev) => prev.slice(0, index + 1));
            }

            // 发送新内容重新生成
            await send(newContent, true);
        }
    }, [messages, send]);

    return useMemo(
        () => ({
            messages,
            isLoading,
            error,
            send,
            stop,  // 新增
            resetConversation,
            retryLastMessage,
            deleteMessage,
            regenerateMessage,
            editMessage,
        }),
        [messages, isLoading, error, send, stop, resetConversation, retryLastMessage, deleteMessage, regenerateMessage, editMessage]
    );
}