"use client";

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
}: ConversationListProps) {
    return (
        <div className="h-full flex flex-col bg-(--paper-100) w-72 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 transition-colors">
            {/* 顶部体验呼吸感布局，移除导入导出按键 */}
            <div className="p-6 pb-4 flex flex-col gap-4">
                <NewConversationButton onClick={onCreateConversation} />
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

            {/* 底部信息无边框化 */}
            <div className="p-6 pt-4 text-xs text-(--charcoal-700)/40 text-center tracking-widest">
                <p>{conversations.length} CONVERSATIONS</p>
            </div>
        </div>
    );
}