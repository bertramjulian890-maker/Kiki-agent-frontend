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
            <div className="flex h-full items-start justify-start px-2 pt-28">
                <div className="max-w-2xl text-left">
                    <h2 className="text-8xl font-serif font-medium tracking-tight text-(--charcoal-700) mb-6">
                        Kiki
                    </h2>
                    <p className="text-2xl font-serif text-(--caramel-500)/90 leading-relaxed mb-12">
                        今天心情美丽吗？<br />在这片纯净的空间里，我会一直静静陪你。
                    </p>

                    <div className="flex flex-wrap gap-4 max-w-xl">
                        <Button
                            variant="ghost"
                            className="justify-start text-left h-auto py-3 px-5 rounded-2xl hover:bg-(--paper-200) transition-all text-(--charcoal-700)"
                            onClick={() => console.log('Start with common questions')}
                        >
                            <span className="text-sm font-medium">问我今天天气如何</span>
                        </Button>

                        <Button
                            variant="ghost"
                            className="justify-start text-left h-auto py-3 px-5 rounded-2xl hover:bg-(--paper-200) transition-all text-(--charcoal-700)"
                            onClick={() => console.log('Start creative conversation')}
                        >
                            <span className="text-sm font-medium">帮我提炼一份灵感</span>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto px-2 pb-36 pt-8 w-full block">
            <div className="mx-auto w-full max-w-3xl space-y-2">
                {messages.map((message, index) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        isLast={index === messages.length - 1}
                        onCopy={() => onCopy?.(message)}
                        onRegenerate={() => onRegenerate?.(message)}
                        onDelete={() => onDelete?.(message)}
                        onEdit={onEdit}
                    />
                ))}

                {error && !isLoading && (
                    <div className="flex w-full items-start gap-5 mb-8">
                        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center mt-1">
                            <span className="text-red-500 font-bold">!</span>
                        </div>
                        <div className="flex flex-col gap-2 items-start flex-1 min-w-0">
                            <div className="text-[15px] leading-relaxed text-red-700/90 font-serif">
                                {error}
                            </div>
                            {onRetry && (
                                <button
                                    onClick={onRetry}
                                    className="text-xs font-semibold text-red-600 hover:text-red-800 uppercase tracking-widest transition-colors"
                                >
                                    Try Again
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}