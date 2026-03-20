"use client";

import { useState, useEffect } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useChat } from "@/hooks/useChat";
import { ConversationList } from "@/components/conversation/ConversationList";
import ChatContainer from "@/components/chat/ChatContainer";
import { SidebarToggleButton } from "@/components/ui/SidebarToggleButton";
import { Button } from "@/components/ui/Button";
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
        deleteMessage,
        regenerateMessage,
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

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // 💡 修复水合错误：初始状态全部默认为 false (或 light theme)
    const [isDark, setIsDark] = useState(false);
    // 💡 新增挂载状态，用于判断是否已经到了客户端
    const [mounted, setMounted] = useState(false);

    // 💡 修复水合错误：在客户端挂载后，再从 localStorage 读取主题设置
    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("theme") === "dark";
        setIsDark(savedTheme);
    }, []);

    // 💡 监听 isDark 变化并同步到 html 标签
    useEffect(() => {
        if (mounted) {
            document.documentElement.classList.toggle("dark", isDark);
        }
    }, [isDark, mounted]);

    useEffect(() => {
        if (!currentConversation) return;
        updateConversationMessages(currentConversation.id, messages);
    }, [messages, currentConversation?.id, updateConversationMessages]);

    const toggleTheme = () => {
        setIsDark((prev) => {
            const next = !prev;
            localStorage.setItem("theme", next ? "dark" : "light");
            return next;
        });
    };

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    const closeSidebar = () => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    const handleCreateConversation = () => {
        createConversation();
        closeSidebar();
    };

    const handleExportConversations = () => {
        exportConversations();
    };

    const handleCopyMessage = (message: Message) => {
        navigator.clipboard.writeText(message.content).catch((err) => {
            console.error("复制失败:", err);
        });
    };

    const handleRegenerateMessage = (message: Message) => {
        if (regenerateActiveMessage) {
            regenerateActiveMessage(message);
        }

        if (!currentConversation) return;
        const messageIndex = currentConversation.messages.findIndex((m) => m.id === message.id);
        if (messageIndex !== -1) {
            regenerateMessage(currentConversation.id, messageIndex);
        }
    };

    const handleDeleteMessage = (message: Message) => {
        if (deleteActiveMessage) {
            deleteActiveMessage(message);
        }

        if (!currentConversation) return;
        const messageIndex = currentConversation.messages.findIndex((m) => m.id === message.id);
        if (messageIndex !== -1) {
            deleteMessage(currentConversation.id, messageIndex);
        }
    };

    const handleEditMessage = (message: Message, newContent: string) => {
        // 💡 2. 调用从 useChat 里拿出来的正牌编辑方法
        if (editActiveMessage) {
            editActiveMessage(message, newContent);
        }

        // 同步更新侧边栏的历史记录
        if (!currentConversation) return;
        const messageIndex = currentConversation.messages.findIndex((m) => m.id === message.id);
        if (messageIndex !== -1) {
            // 如果你的 useConversations 钩子里也有负责编辑保存的方法（比如 editConversationMessage），在这里调用
            // 否则依靠上面的 useEffect 自动同步也可以
        }
    };

    // 💡 防止内容闪烁：在未挂载前返回一个简单的结构，或者直接 return null
    if (!mounted) {
        return <div className="flex h-dvh bg-(--paper-100)" />;
    }

    return (
        <div className="flex h-dvh overflow-hidden bg-(--paper-100) transition-colors duration-300">
            <div
                className={`fixed inset-y-0 left-0 z-40 w-72 bg-(--paper-100) transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <ConversationList
                    conversations={conversations}
                    currentConversationId={currentConversation?.id || null}
                    onSelectConversation={switchConversation}
                    onDeleteConversation={deleteConversation}
                    onRenameConversation={renameConversation}
                    onTogglePinConversation={togglePinConversation}
                    onDuplicateConversation={duplicateConversation}
                    onCreateConversation={handleCreateConversation}
                    onExportConversations={handleExportConversations}
                />
            </div>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-20 border-b border-(--paper-300) bg-(--paper-100)/90 backdrop-blur transition-colors duration-300">
                    <div className="mx-auto flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                            <SidebarToggleButton isOpen={isSidebarOpen} onClick={toggleSidebar} />
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleTheme}
                                className="p-2 rounded-lg hover:bg-(--paper-200) transition-colors"
                                title={isDark ? "切换到浅色模式" : "切换到深色模式"}
                            >
                                {isDark ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-(--charcoal-700)">
                                        <circle cx="12" cy="12" r="5"></circle>
                                        <line x1="12" y1="1" x2="12" y2="3"></line>
                                        <line x1="12" y1="21" x2="12" y2="23"></line>
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                        <line x1="1" y1="12" x2="3" y2="12"></line>
                                        <line x1="21" y1="12" x2="23" y2="12"></line>
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-(--charcoal-700)">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                                    </svg>
                                )}
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-hidden transition-colors duration-300">
                    {currentConversation ? (
                        <ChatContainer
                            messages={messages}
                            isLoading={isLoading}
                            error={error}
                            onSend={send}
                            onResetConversation={resetConversation}
                            onRetry={retryLastMessage}
                            onCopyMessage={handleCopyMessage}
                            onRegenerateMessage={handleRegenerateMessage}
                            onDeleteMessage={handleDeleteMessage}
                            onEditMessage={handleEditMessage}
                            isDark={isDark}
                            onToggleTheme={toggleTheme}
                            onStop={stop}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-(--charcoal-700)/50">
                            <div className="text-center">
                                <p className="text-lg font-medium">请选择或创建一个对话</p>
                                <p className="mt-2 text-sm">开始与 Kiki 的对话吧！</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}