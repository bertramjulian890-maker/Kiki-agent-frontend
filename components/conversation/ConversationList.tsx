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
                console.log('Importing file:', file.name);
            } catch (error) {
                console.error('Import failed:', error);
            }
        }
        event.target.value = '';
    };

    return (
        <div className="h-full flex flex-col bg-(--paper-100) w-72 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 transition-colors">
            {/* 顶部体验呼吸感布局，移除边框并且加大留白 */}
            <div className="p-6 pb-4 flex flex-col gap-4">
                <NewConversationButton onClick={onCreateConversation} />
                
                <div className="flex gap-2 justify-end w-full">
                    <button
                        onClick={onExportConversations}
                        className="p-2 rounded-xl text-(--charcoal-700)/50 hover:text-(--charcoal-700) hover:bg-(--paper-200) transition-all"
                        title="导出对话数据"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                    <button
                        onClick={handleImportClick}
                        className="p-2 rounded-xl text-(--charcoal-700)/50 hover:text-(--charcoal-700) hover:bg-(--paper-200) transition-all"
                        title="导入对话数据"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </button>
                </div>
            </div>

            {/* 对话列表，保留轻盈滚动 */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-1">
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

            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* 底部信息无边框化 */}
            <div className="p-6 pt-4 text-xs text-(--charcoal-700)/40 text-center tracking-widest">
                <p>{conversations.length} CONVERSATIONS</p>
            </div>
        </div>
    );
}