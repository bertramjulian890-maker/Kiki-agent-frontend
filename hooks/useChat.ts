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
    const [prevId, setPrevId] = useState(conversationId);

    // 💡 修复：利用 React 的组件渲染拦截 (Render phase state update)
    // 直接在渲染期比对 ID，如果 ID 变了，马上同步最新初始消息。
    // 这比 useEffect (挂载后才执行) 快一个渲染周期，完美解决切换对话时的消息覆盖 Bug！
    if (conversationId !== prevId) {
        setPrevId(conversationId);
        setMessages(initialMessages);
        setError(null);
    }

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
                isThinking: true,
                thinkingMessage: "Kiki 正在思考...",
            };

            if (isRegenerate) {
                setMessages((prev) => [...prev, assistantPlaceholder]);
            } else {
                setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
            }

            try {
                await consume(streamMessage({ message: text, conversationId }, signal), {
                    // 🚀 名字从 onChunk 变成了 onData
                    onData: (event) => {
                        setMessages((prev) =>
                            prev.map((m) => {
                                if (m.id !== assistantId) return m;

                                // 直接使用 event 对象进行状态分发
                                switch (event.type) {
                                    case 'event':
                                        if (event.status === 'thinking') {
                                            return { ...m, isThinking: true, thinkingMessage: event.message };
                                        }
                                        break;

                                    case 'tool':
                                        const currentTools = m.tools ? [...m.tools] : [];
                                        const existingToolIndex = currentTools.findIndex(
                                            t => t.tool_name === event.tool_name && t.tool_input === event.tool_input
                                        );

                                        if (existingToolIndex >= 0) {
                                            currentTools[existingToolIndex].status = event.status;
                                        } else {
                                            currentTools.push({
                                                tool_name: event.tool_name,
                                                tool_input: event.tool_input,
                                                status: event.status
                                            });
                                        }
                                        return { ...m, tools: currentTools, isThinking: true };

                                    case 'chunk':
                                        return {
                                            ...m,
                                            content: m.content + (event.content || ""),
                                            isThinking: false
                                        };
                                }
                                return m;
                            })
                        );
                    },
                    onEnd: (finalText) => {
                        // 结束时确保思考状态关闭
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === assistantId
                                    ? { ...m, content: finalText || m.content, isStreaming: false, isThinking: false }
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
        // 🚀 彻底移除对外部 messages 闭包的依赖，使用 prev 确保拿到最新状态
        let shouldSend = false;

        setMessages((prev) => {
            const index = prev.findIndex((m) => m.id === messageToEdit.id);
            if (index === -1) return prev;

            if (messageToEdit.role !== "user") {
                const newArr = [...prev];
                newArr[index] = { ...newArr[index], content: newContent };
                return newArr;
            }

            // 如果是 user 消息，不仅修改，还要截断后面的消息
            shouldSend = true;
            return prev.slice(0, index).concat({
                ...prev[index],
                content: newContent
            });
        });

        // 这里的 send 内部也使用了 setMessages，会被 React 18 正确批处理
        if (shouldSend) {
            await send(newContent, true);
        }
    }, [send]); // 🚀 依赖数组中去掉了 messages，极大减轻重绘负担

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