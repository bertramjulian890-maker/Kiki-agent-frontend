"use client";

import { useRef } from "react";
import type { Conversation } from "@/types/chat";
import { ConversationItem } from "./ConversationItem";
import { NewConversationButton } from "./NewConversationButton";

interface ConversationListProps {
    conversations: Conversation[];
    currentConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onDeleteConversation: (id: string) => void;
    onRenameConversation: (id: string, title: string) => void;
    onTogglePinConversation: (id: string) => void;
    onDuplicateConversation: (id: string) => void;
    onCreateConversation: () => void;
    onExportConversations: () => void;
}

export function ConversationList({
    conversations,
    currentConversationId,
    onSelectConversation,
    onDeleteConversation,
    onRenameConversation,
    onTogglePinConversation,
    onDuplicateConversation,
    onCreateConversation,
    onExportConversations,
}: ConversationListProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                // 这里可以添加导入逻辑
                console.log('Importing file:', file.name);
            } catch (error) {
                console.error('Import failed:', error);
            }
        }
        // 重置 input 以允许选择同一文件
        event.target.value = '';
    };

    return (
        <div className="h-full flex flex-col bg-var(--paper-100) border-r border-var(--paper-300) w-72">
            {/* 顶部操作区域 */}
            <div className="p-4 border-b border-var(--paper-300)">
                <div className="flex gap-2 mb-3">
                    <NewConversationButton onClick={onCreateConversation} />
                    <button
                        onClick={onExportConversations}
                        className="p-2 rounded-lg bg-var(--paper-200) hover:bg-var(--paper-300) transition-colors"
                        title="导出对话数据"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-var(--charcoal-700)"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </button>
                    <button
                        onClick={handleImportClick}
                        className="p-2 rounded-lg bg-var(--paper-200) hover:bg-var(--paper-300) transition-colors"
                        title="导入对话数据"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-var(--charcoal-700)"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                    </button>
                </div>
            </div>

            {/* 对话列表 */}
            <div className="flex-1 overflow-y-auto p-2">
                {conversations.map((conversation) => (
                    <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        isSelected={conversation.id === currentConversationId}
                        onSelect={() => onSelectConversation(conversation.id)}
                        onDelete={() => onDeleteConversation(conversation.id)}
                        onRename={(title) => onRenameConversation(conversation.id, title)}
                        onTogglePin={() => onTogglePinConversation(conversation.id)}
                        onDuplicate={() => onDuplicateConversation(conversation.id)}
                    />
                ))}
            </div>

            {/* 导入文件输入 */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* 底部信息 */}
            <div className="p-4 border-t border-var(--paper-300) text-xs text-var(--charcoal-700)/70">
                <p>共 {conversations.length} 个对话</p>
                <p className="mt-1">数据仅存储在浏览器中</p>
            </div>
        </div>
    );
}