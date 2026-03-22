"use client";

import type { Message } from "@/types/chat";
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
    onEditMessage?: (message: Message, newContent: string) => void;
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
}: ChatContainerProps) {
    return (
        <div className="relative flex h-full flex-1 flex-col overflow-hidden text-(--charcoal-700)">
            {/* 消息滚动区 */}
            <section className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-32">
                <div className="mx-auto w-full max-w-3xl px-4 py-8 pb-10">
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
                </div>
            </section>

            {/* 输入框定位 */}
            <footer className="absolute bottom-2 md:bottom-6 left-0 right-0 px-4 z-10 pointer-events-none">
                <div className="mx-auto max-w-3xl pointer-events-auto transition-transform duration-300">
                    <ChatInput
                        isLoading={isLoading}
                        onSend={onSend}
                        onStop={onStop}
                        placeholder="给 Kiki 发送消息..."
                    />
                </div>
            </footer>
        </div>
    );
}