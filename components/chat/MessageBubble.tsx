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
        } catch (err) {}
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
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const isUser = message.role === 'user';
    const isError = message.content.includes('错误') || message.content.includes('fail');
    const isThinkingOnly = !isUser && message.isThinking && !message.content;

    return (
        <div className="flex w-full items-start gap-4 sm:gap-6 pb-8 group pl-1 pr-2 relative transition-all">
            {/* 头像区域：取消左右横跳，全部左对齐 */}
            <div className={`w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 mt-1 select-none flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                isUser 
                    ? 'bg-(--paper-200) text-(--charcoal-700)' 
                    : 'bg-(--caramel-500) text-white shadow-[0_2px_10px_rgba(201,42,42,0.2)]'
            }`}>
                {isUser ? 'Y' : 'K'}
            </div>

            {/* 内容主干区域 */}
            <div className="flex flex-col flex-1 min-w-0">
                
                {/* 顶部元信息与悬浮操作栏 */}
                <div className="flex items-center justify-between mb-1.5 h-6">
                    <span className="font-semibold text-[13px] text-(--charcoal-700)/60 tracking-wider uppercase select-none">
                        {isUser ? 'You' : 'Kiki'}
                    </span>
                    
                    {/* 动作栏 */}
                    {!message.isStreaming && !message.isThinking && (
                        <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center gap-1" ref={menuRef}>
                            <button onClick={handleCopy} className="p-1 rounded bg-transparent hover:bg-(--paper-200) text-(--charcoal-700)/40 hover:text-(--charcoal-700) transition-colors" title="复制">
                                {copySuccess 
                                    ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                }
                            </button>
                            {isUser && onEdit && (
                                <button onClick={handleEdit} className="p-1 rounded hover:bg-(--paper-200) text-(--charcoal-700)/40 hover:text-(--charcoal-700) transition-colors" title="编辑">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                            )}
                            {!isUser && onRegenerate && isLast && (
                                <button onClick={() => onRegenerate(message)} className="p-1 rounded hover:bg-(--paper-200) text-(--charcoal-700)/40 hover:text-(--charcoal-700) transition-colors" title="重试">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6"></path><path d="M2 11.5a10 10 0 0 1 18.8-4.3"></path><path d="M2.5 22v-6h6"></path><path d="M22 12.5a10 10 0 0 1-18.8 4.2"></path></svg>
                                </button>
                            )}
                            {onDelete && (
                                <button onClick={() => onDelete(message)} className="p-1 rounded hover:bg-red-50 text-(--charcoal-700)/40 hover:text-red-500 transition-colors" title="删除">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* 思考状态展示 */}
                {message.isThinking && (
                    <div className="flex items-center gap-1.5 h-[24px] mb-2 select-none">
                        <div className="flex items-center gap-[3px]">
                            <span className="w-1 h-1 rounded-full bg-(--charcoal-700)/30 animate-breath-slow delay-0"></span>
                            <span className="w-1 h-1 rounded-full bg-(--charcoal-700)/30 animate-breath-slow delay-150"></span>
                            <span className="w-1 h-1 rounded-full bg-(--charcoal-700)/30 animate-breath-slow delay-300"></span>
                        </div>
                        <span className="text-sm text-(--charcoal-700)/40 italic font-serif">
                            {message.thinkingMessage || "正在思考..."}
                        </span>
                    </div>
                )}

                {/* 文本内容：无包裹，纯粹排版 */}
                {!isThinkingOnly && (
                    <div className={`text-[16px] sm:text-[16.5px] leading-[1.8] font-serif break-words ${
                        isError ? 'text-red-600' : 'text-(--charcoal-700)'
                    }`}>
                        {isEditing ? (
                            <div className="flex flex-col gap-3 mt-1">
                                <textarea
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-full bg-(--paper-100) border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-(--caramel-500)/30 resize-none"
                                    rows={3}
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={handleCancelEdit} className="px-4 py-1.5 text-sm rounded-lg hover:bg-(--paper-200) text-(--charcoal-700) transition-colors">取消</button>
                                    <button onClick={handleSaveEdit} className="px-4 py-1.5 text-sm rounded-lg bg-(--charcoal-700) hover:bg-black text-white transition-colors">保存</button>
                                </div>
                            </div>
                        ) : (
                            <MessageContent content={message.content} isStreaming={message.isStreaming} isUser={isUser} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}