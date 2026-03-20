// components/conversation/ConversationItem.tsx - 增强版本
"use client";

import { useState, useRef } from "react";
import type { Conversation } from "@/types/chat";

interface ConversationItemProps {
    conversation: Conversation;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onRename: (title: string) => void;
    onTogglePin?: () => void;
    onDuplicate?: () => void;
    onExport?: () => void;
}

export function ConversationItem({
    conversation,
    isSelected,
    onSelect,
    onDelete,
    onRename,
    onTogglePin,
    onDuplicate,
    onExport,
}: ConversationItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(conversation.title);
    const inputRef = useRef<HTMLInputElement>(null);

    // 开始编辑时聚焦
    const handleStartEditing = () => {
        setIsEditing(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (editValue.trim() && editValue !== conversation.title) {
            onRename(editValue.trim());
        } else {
            setEditValue(conversation.title);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleBlur();
        } else if (event.key === 'Escape') {
            setIsEditing(false);
            setEditValue(conversation.title);
        }
    };



    return (
        <div
            className={`group relative flex items-center gap-2 p-3 rounded-lg mb-1 transition-colors cursor-pointer ${isSelected
                ? 'bg-(--caramel-500)/10 border border-(--caramel-500)'
                : 'hover:bg-(--paper-200) border border-transparent'
                }`}
            onClick={onSelect}
            onDoubleClick={handleStartEditing}
        >
            {/* 对话图标 */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-(--paper-200) flex items-center justify-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-(--charcoal-700)"
                >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </div>

            {/* 对话信息 */}
            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent border-b border-(--charcoal-700) text-sm focus:outline-none focus:border-(--caramel-500)"
                    />
                ) : (
                    <div className="text-sm truncate">
                        <span className={`${isSelected ? 'text-(--caramel-500) font-medium' : 'text-(--charcoal-700)'
                            }`}>
                            {conversation.title}
                        </span>
                        {conversation.isPinned && (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="inline ml-1 text-(--caramel-500)"
                            >
                                <path d="M21 21l-6-6m2-5v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h5l2-2h4a2 2 0 0 1 2 2z"></path>
                            </svg>
                        )}
                    </div>
                )}
                <div className="text-xs text-(--charcoal-700)/50">
                    {conversation.messages.length} 条消息
                </div>
            </div>

            {/* 操作菜单 */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity duration-200">
                {onTogglePin && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin();
                        }}
                        className={`p-1.5 rounded hover:bg-(--paper-300) transition-all duration-150 ${conversation.isPinned
                            ? 'text-(--caramel-500)'
                            : 'text-(--charcoal-700)/60 hover:text-(--charcoal-700)'
                            }`}
                        title={conversation.isPinned ? '取消置顶' : '置顶对话'}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill={conversation.isPinned ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 17v5"></path>
                            <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"></path>
                        </svg>
                    </button>
                )}

                {onDuplicate && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate();
                        }}
                        className="p-1.5 rounded hover:bg-(--paper-300) text-(--charcoal-700)/60 hover:text-(--charcoal-700) transition-all duration-150"
                        title="复制对话"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                )}

                {onExport && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onExport();
                        }}
                        className="p-1.5 rounded hover:bg-(--paper-300) text-(--charcoal-700)/60 hover:text-(--charcoal-700) transition-all duration-150"
                        title="导出对话"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </button>
                )}

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="p-1.5 rounded hover:bg-red-50 text-(--charcoal-700)/60 hover:text-red-600 transition-all duration-150"
                    title="删除对话"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
}