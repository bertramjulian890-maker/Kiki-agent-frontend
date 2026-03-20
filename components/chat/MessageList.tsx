// components/chat/MessageList.tsx - 优化版
"use client";

import type { Message } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { Button } from "@/components/ui/Button";


interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    onCopy?: (message: Message) => void;
    onRegenerate?: (message: Message) => void;
    onDelete?: (message: Message) => void;
    onEdit?: (message: Message, newContent: string) => void;
    onRetry?: () => void;
}

export function MessageList({
    messages,
    isLoading,
    error,
    onCopy,
    onRegenerate,
    onDelete,
    onEdit,
    onRetry,
}: MessageListProps) {
    if (messages.length === 0) {
        return (
            // 💡 1. 移除 items-center(垂直居中)，改为 items-start(顶部对齐)
            // 💡 2. 增加 pt-20 (顶部内边距)，让它“偏上”而不是贴死最顶端
            <div className="flex h-full items-start justify-start px-8 pt-20">
                {/* 💡 3. 移除 mx-auto (居中)，改为 text-left (左对齐) */}
                <div className="max-w-xl text-left">
                    <h2 className="text-7xl font-serif font-bold tracking-tighter text-(--charcoal-700) mb-3">
                        Kiki
                    </h2>
                    <p className="text-2xl font-serif text-(--caramel-500)/90 mb-8">
                        今天心情美丽吗？<br />我会一直在这里陪你聊天。
                    </p>

                    {/* 快速开始提示 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                        <Button
                            variant="ghost"
                            className="justify-start text-left h-auto py-3 px-4"
                            onClick={() => console.log('Start with common questions')}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-2 text-(--caramel-500)"
                            >
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            <span className="text-sm">问我今天天气如何</span>
                        </Button>

                        <Button
                            variant="ghost"
                            className="justify-start text-left h-auto py-3 px-4"
                            onClick={() => console.log('Start creative conversation')}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-2 text-(--caramel-500)"
                            >
                                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                <path d="M2 17l10 5 10-5"></path>
                                <path d="M2 12l10 5 10-5"></path>
                            </svg>
                            <span className="text-sm">帮我写一首诗</span>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto px-4 pb-28 pt-4">
            <div className="mx-auto max-w-2xl space-y-4">
                {messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        onCopy={() => onCopy?.(message)}
                        onRegenerate={() => onRegenerate?.(message)}
                        onDelete={() => onDelete?.(message)}
                        onEdit={onEdit}
                    />
                ))}

                {/* 错误状态 */}
                {error && !isLoading && (
                    <div className="flex w-full justify-start gap-3">
                        {/* 1. 左侧图标保持不变 */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>

                        {/* 2. 💡 关键：使用气泡容器 */}
                        <div className="flex flex-col gap-1 items-start max-w-[80%]">
                            <div className="relative rounded-lg px-3 py-2 bg-red-50 border border-red-100 text-red-700 rounded-tl-none">
                                <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                    {error}
                                </div>
                            </div>

                            {/* 3. 重试按钮移到气泡下方，显得更整洁 */}
                            {onRetry && (
                                <button
                                    onClick={onRetry}
                                    className="mt-1 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 rounded-md transition-colors border border-red-200"
                                >
                                    尝试重新发送
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}