"use client";
import { MessageContent } from "./MessageContent";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { Message } from "@/types/chat";

interface MessageBubbleProps {
    message: Message;
    isLast?: boolean;
    onCopy?: (message: Message) => void;
    onRegenerate?: (message: Message) => void;
    onDelete?: (message: Message) => void;
    onEdit?: (message: Message, newContent: string) => void;
}

export function MessageBubble({
    message,
    isLast = false,
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

    // 🚀 核心判断：当前是否处于“只思考，无正文”的真空期
    const isThinkingOnly = !isUser && message.isThinking && !message.content;

    return (
        <div className={`flex w-full items-start gap-4 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`group relative max-w-[85%] flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>

                {/* 🚀 视觉优化 1：如果只有思考状态没有正文，彻底隐藏这个带背景色的方块，防止出现空心气泡 */}
                {!isThinkingOnly && (
                    <div
                        className={`relative text-[15px] transition-colors ${isUser
                            ? 'px-3 py-2 shadow-sm bg-(--caramel-500)/90 text-(--paper-100) rounded-2xl rounded-tr-sm'
                            : isError
                                ? 'px-3 py-2 shadow-sm bg-red-50 text-red-700 border border-red-200 rounded-2xl rounded-tl-sm dark:bg-red-900/20'
                                : 'py-1 text-(--charcoal-700)'
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
                )}

                {/* 🚀 视觉优化 2：极致小巧的思考动画，对齐在菜单栏的位置 */}
                {message.isThinking && (
                    <div className="flex items-center gap-1.5 pl-2 h-[26px] select-none">
                        <div className="flex items-center gap-[3px]">
                            {/* 圆点尺寸从 w-1.5 缩小到了 w-1，极其精致 */}
                            <span className="w-1 h-1 rounded-full bg-(--charcoal-700)/40 animate-breath-slow delay-0"></span>
                            <span className="w-1 h-1 rounded-full bg-(--charcoal-700)/40 animate-breath-slow delay-150"></span>
                            <span className="w-1 h-1 rounded-full bg-(--charcoal-700)/40 animate-breath-slow delay-300"></span>
                        </div>
                        {/* 文字尺寸设为 text-xs，颜色调淡 */}
                        <span className="text-xs text-(--charcoal-700)/40 italic font-serif tracking-wide animate-breath-slow">
                            {message.thinkingMessage || "正在思考..."}
                        </span>
                    </div>
                )}

                {/* 🚀 视觉优化 3：外部 Streaming 动画 Logo (取代内部的打字机光标) */}
                {!isUser && message.isStreaming && !message.isThinking && (
                    <motion.div 
                        className="flex items-center justify-start pl-3 py-1 text-(--caramel-500)"
                        animate={{ scale: [0.8, 1.15, 0.8], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                        title="Kiki 正在输入..."
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <path d="M12 2C12 2 12 10 20 12C12 14 12 22 12 22C12 22 12 14 4 12C12 10 12 2 12 2Z" />
                        </svg>
                    </motion.div>
                )}

                {/* 原本的菜单栏逻辑：只有在【不打字】且【不思考】时才允许 hover 显示 */}
                {!isUser && !message.isStreaming && !message.isThinking && (
                    <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 flex items-center justify-start gap-1.5 pl-1 pt-1 transition-opacity duration-300 w-full" ref={menuRef}>
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

                        {onRegenerate && isLast && (
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
                        <button
                            onClick={handleEdit}
                            className="p-1.5 rounded-md hover:bg-(--paper-300) text-(--charcoal-700)/40 hover:text-(--charcoal-700) transition-colors"
                            title="编辑消息"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>

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