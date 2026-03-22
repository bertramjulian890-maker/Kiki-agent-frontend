"use client";

import { useState, useEffect } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useChat } from "@/hooks/useChat";
import { ConversationList } from "@/components/conversation/ConversationList";
import ChatContainer from "@/components/chat/ChatContainer";
import { AppLayout } from "@/components/layout/AppLayout";
import { Message } from "@/types/chat";

export default function Page() {
    const {
        conversations,
        currentConversation,
        createConversation,
        switchConversation,
        deleteConversation,
        renameConversation,
        togglePinConversation,
        duplicateConversation,
        exportConversations,
        updateConversationMessages,
    } = useConversations();

    const {
        messages,
        isLoading,
        error,
        send,
        stop,
        resetConversation,
        retryLastMessage,
        deleteMessage: deleteActiveMessage,
        regenerateMessage: regenerateActiveMessage,
        editMessage: editActiveMessage,
    } = useChat({
        conversationId: currentConversation?.id,
        initialMessages: currentConversation?.messages ?? [],
    });

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (window.innerWidth >= 768) {
            setIsSidebarOpen(true);
        }
    }, []);

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
    const closeSidebar = () => {
        if (window.innerWidth < 768) setIsSidebarOpen(false);
    };

    useEffect(() => {
        if (!currentConversation) return;
        if (isLoading) return;
        updateConversationMessages(currentConversation.id, messages);
    }, [messages, isLoading, currentConversation, updateConversationMessages]);

    const handleCreateConversation = () => {
        createConversation();
        closeSidebar();
    };

    const handleCopyMessage = (message: Message) => {
        navigator.clipboard.writeText(message.content).catch((err) => {
            console.error("复制失败:", err);
        });
    };

    if (!mounted) return null;

    return (
        <AppLayout
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={toggleSidebar}
            onCloseSidebar={closeSidebar}
            sidebarContent={
                <ConversationList
                    conversations={conversations}
                    currentConversationId={currentConversation?.id || null}
                    onSelectConversation={switchConversation}
                    onDeleteConversation={deleteConversation}
                    onRenameConversation={renameConversation}
                    onTogglePinConversation={togglePinConversation}
                    onDuplicateConversation={duplicateConversation}
                    onCreateConversation={handleCreateConversation}
                    onExportConversations={exportConversations}
                />
            }
            mainContent={
                currentConversation ? (
                    <ChatContainer
                        messages={messages}
                        isLoading={isLoading}
                        error={error}
                        onSend={send}
                        onResetConversation={resetConversation}
                        onRetry={retryLastMessage}
                        onCopyMessage={handleCopyMessage}
                        onRegenerateMessage={(msg) => regenerateActiveMessage && regenerateActiveMessage(msg)}
                        onDeleteMessage={(msg) => deleteActiveMessage && deleteActiveMessage(msg)}
                        onEditMessage={(msg, content) => editActiveMessage && editActiveMessage(msg, content)}
                        onStop={stop}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-(--charcoal-400)">
                        欢迎使用 Kiki Agent，请选择或新建一个对话以开始。
                    </div>
                )
            }
        />
    );
}