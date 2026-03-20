"use client";

import type { Message } from "@/types/chat";
import { Button } from "@/components/ui/Button";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

type ChatContainerProps = {
    messages: Message[];
    isLoading: boolean;
    onSend: (value: string) => Promise<void>;
    error: string | null;
    onRetry?: () => Promise<void>;
    onCopyMessage?: (message: Message) => void;
    onRegenerateMessage?: (message: Message) => void;
    onDeleteMessage?: (message: Message) => void;
    isDark: boolean;
    onEditMessage?: (message: Message, newContent: string) => void;
    onToggleTheme: () => void;
    onResetConversation: () => void;
    onStop?: () => void;
};

export default function ChatContainer({
    messages,
    isLoading,
    onSend,
    onStop,
    error,
    onRetry,
    onCopyMessage,
    onRegenerateMessage,
    onDeleteMessage,
    onEditMessage,
    isDark,
    onToggleTheme,
    onResetConversation,
}: ChatContainerProps) {
    return (
        <main className="flex h-full flex-1 flex-col overflow-hidden text-[var(--charcoal-700)]">
            <header className="sticky top-0 z-20  border-[var(--caramel-500)] bg-[color:var(--paper-100)]/0 px-4 py-3 backdrop-blur">
                <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
                </div>
            </header>

            <section className="min-h-0 flex-1 overflow-hidden">
                <MessageList
                    messages={messages}
                    isLoading={isLoading}
                    error={error}
                    onCopy={onCopyMessage}
                    onRegenerate={onRegenerateMessage}
                    onDelete={onDeleteMessage}
                    onRetry={onRetry}
                    onEdit={onEditMessage}
                />
            </section>

            <ChatInput isLoading={isLoading} onSend={onSend} onStop={onStop} placeholder="输入消息..." />
        </main>
    );
}
