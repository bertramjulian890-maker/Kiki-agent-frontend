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
        <main className="relative flex h-full flex-1 flex-col overflow-hidden text-(--charcoal-700)">
            {/* Header 保持原样 */}
            <header className="sticky top-0 z-20 border-b border-(--paper-300) bg-(--paper-100)/90 px-4 py-3 backdrop-blur transition-colors duration-300">
                <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
                </div>
            </header>

            {/* 🚀 核心布局修复：确保滚动区域靠左，且有正确的内边距 */}
            <section className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {/* 这里是消息列表的容器：
                  1. mx-auto max-w-3xl: 在宽屏下居中，保持最大宽度。
                  2. flex flex-col items-start: 🚀 关键！强制内部所有子元素默认靠左对齐。
                */}
                <div className="mx-auto w-full max-w-3xl px-4 py-8 pb-32">
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

            {/* Input 改为悬浮卡片 */}
            <footer className="absolute bottom-6 left-0 right-0 px-4 z-10 pointer-events-none">
                <div className="mx-auto max-w-3xl pointer-events-auto">
                    <ChatInput
                        isLoading={isLoading}
                        onSend={onSend}
                        onStop={onStop}
                        placeholder="输入消息..."
                    />
                </div>
            </footer>
        </main>
    );
}