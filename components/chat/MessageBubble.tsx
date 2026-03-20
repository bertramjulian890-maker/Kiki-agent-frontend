"use client";
import { MessageContent } from "./MessageContent";
import { useState, useRef, useEffect } from "react";
import type { Message } from "@/types/chat";

interface MessageBubbleProps {
    message: Message;
    onCopy?: (message: Message) => void;
    onRegenerate?: (message: Message) => void;
    onDelete?: (message: Message) => void;
    onEdit?: (message: Message, newContent: string) => void;
}

export function MessageBubble({
    message,
    onCopy,
    onRegenerate,
    onDelete,
    onEdit,
}: MessageBubbleProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(message.content);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
            if (onCopy) onCopy(message);
        } catch (err) {
            console.error('复制失败:', err);
        }
        setIsMenuOpen(false);
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditValue(message.content);
        setIsMenuOpen(false);
    };

    const handleSaveEdit = () => {
        if (editValue.trim() && editValue !== message.content) {
            onEdit?.(message, editValue.trim());
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditValue(message.content);
        setIsEditing(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const isUser = message.role === 'user';
    const isError = message.content.includes('错误') || message.content.includes('fail');

    return (
        <div className={`flex w-full items-start gap-4 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`group relative max-w-[85%] flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>

                {/* 💡 修复：恢复气泡的大圆角、大内边距和高级阴影 */}
                <div
                    className={`relative px-3 py-2 text-[15px] shadow-sm transition-colors ${isUser
                        ? 'bg-(--caramel-500)/90 text-(--paper-100) rounded-2xl rounded-tr-sm'
                        : isError
                            ? 'bg-red-50 text-red-700 border border-red-200 rounded-2xl rounded-tl-sm dark:bg-red-900/20'
                            : 'bg-(--paper-100) text-(--charcoal-700) rounded-2xl rounded-tl-sm'
                        }`}
                >
                    {isEditing ? (
                        <div className="flex flex-col gap-2">
                            <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full bg-transparent border border-(--paper-300) rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-(--caramel-500) resize-none"
                                rows={3}
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-3 py-1 text-xs rounded-md hover:bg-(--paper-300) text-(--charcoal-700) transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="px-3 py-1 text-xs rounded-md bg-(--caramel-500) hover:bg-(--caramel-600) text-white transition-colors"
                                >
                                    保存
                                </button>
                            </div>
                        </div>
                    ) : (
                        <MessageContent
                            content={message.content}
                            isStreaming={message.isStreaming}
                            isUser={isUser}
                        />
                    )}
                </div>

                {/* 💡 修复：恢复 !message.isStreaming，打字时隐藏菜单 */}
                {!isUser && !message.isStreaming && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 pl-2 transition-opacity duration-300" ref={menuRef}>
                        <button
                            onClick={handleCopy}
                            className="p-1.5 rounded-md hover:bg-(--paper-300) text-(--charcoal-700)/40 hover:text-(--charcoal-700) transition-colors"
                            title="复制消息"
                        >
                            {copySuccess ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            )}
                        </button>

                        {onRegenerate && (
                            <button
                                onClick={() => onRegenerate(message)}
                                className="p-1.5 rounded-md hover:bg-(--paper-300) text-(--charcoal-700)/40 hover:text-(--charcoal-700) transition-colors"
                                title="重新生成"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6"></path><path d="M2 11.5a10 10 0 0 1 18.8-4.3"></path><path d="M2.5 22v-6h6"></path><path d="M22 12.5a10 10 0 0 1-18.8 4.2"></path></svg>
                            </button>
                        )}

                        {onDelete && (
                            <button
                                onClick={() => onDelete(message)}
                                className="p-1.5 rounded-md hover:bg-red-50 text-(--charcoal-700)/40 hover:text-red-600 transition-colors dark:hover:bg-red-900/30"
                                title="删除消息"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        )}
                    </div>
                )}

                {isUser && !message.isStreaming && onEdit && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 pl-2 transition-opacity duration-300" ref={menuRef}>
                        {/* 编辑按钮 - 用户消息专用 */}
                        <button
                            onClick={handleEdit}
                            className="p-1.5 rounded-md hover:bg-(--paper-300) text-(--charcoal-700)/40 hover:text-(--charcoal-700) transition-colors"
                            title="编辑消息"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>

                        {/* 删除按钮 */}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(message)}
                                className="p-1.5 rounded-md hover:bg-red-50 text-(--charcoal-700)/40 hover:text-red-600 transition-colors dark:hover:bg-red-900/30"
                                title="删除消息"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        )}
                    </div>
                )}



            </div>
        </div>
    );
}