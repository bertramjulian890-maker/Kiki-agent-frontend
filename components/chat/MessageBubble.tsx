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
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} pb-8 group pl-1 pr-2 relative transition-all`}>
            
            {/* 内容主干区域 */}
            <div className={`flex flex-col min-w-0 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                
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

                {/* 文本内容：用户是气泡框，AI 是自然陈列 */}
                {!isThinkingOnly && (
                    <div className={`text-[16px] sm:text-[16.5px] leading-[1.8] font-serif transition-all ${
                        isUser 
                            ? 'bg-(--caramel-500) text-white px-5 py-3 rounded-[26px] rounded-br-[8px] w-fit shadow-[0_4px_14px_rgba(201,42,42,0.15)] selection:bg-white/20'
                            : isError 
                                ? 'text-red-600 w-full' 
                                : 'text-(--charcoal-700) w-full'
                    }`}>
                        {isEditing ? (
                            <div className="flex flex-col gap-3 mt-1 min-w-[280px]">
                                <textarea
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className={`w-full border-none rounded-2xl px-4 py-3 focus:outline-none resize-none ${
                                        isUser 
                                         ? 'bg-black/10 text-white placeholder:text-white/50 focus:ring-1 focus:ring-white/30'
                                         : 'bg-(--paper-100) text-(--charcoal-700) focus:ring-1 focus:ring-(--caramel-500)/30'
                                    }`}
                                    rows={3}
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={handleCancelEdit} className={`px-4 py-1.5 text-sm rounded-xl transition-colors ${
                                        isUser ? 'hover:bg-black/20 text-white' : 'hover:bg-(--paper-200) text-(--charcoal-700)'
                                    }`}>取消</button>
                                    <button onClick={handleSaveEdit} className={`px-4 py-1.5 text-sm rounded-xl transition-colors ${
                                        isUser ? 'bg-white text-(--caramel-500) hover:bg-white/90' : 'bg-(--charcoal-700) hover:bg-black text-white'
                                    }`}>保存</button>
                                </div>
                            </div>
                        ) : (
                            <MessageContent content={message.content} isStreaming={message.isStreaming} isUser={isUser} />
                        )}
                    </div>
                )}

                {/* 菜单悬浮栏：现在放在内容下方，增强逻辑感 */}
                {!message.isStreaming && !message.isThinking && (
                    <div className={`mt-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center gap-1 ${isUser ? 'mr-1 flex-row-reverse' : 'ml-1'}`} ref={menuRef}>
                        {isUser && onEdit && (
                            <button onClick={handleEdit} className="p-1 rounded hover:bg-(--paper-200) text-(--charcoal-700)/30 hover:text-(--charcoal-700) transition-colors" title="编辑">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                        )}
                        <button onClick={handleCopy} className="p-1 rounded bg-transparent hover:bg-(--paper-200) text-(--charcoal-700)/30 hover:text-(--charcoal-700) transition-colors" title="复制">
                            {copySuccess 
                                ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            }
                        </button>
                        {!isUser && onRegenerate && isLast && (
                            <button onClick={() => onRegenerate(message)} className="p-1 rounded hover:bg-(--paper-200) text-(--charcoal-700)/30 hover:text-(--charcoal-700) transition-colors" title="重试">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6"></path><path d="M2 11.5a10 10 0 0 1 18.8-4.3"></path><path d="M2.5 22v-6h6"></path><path d="M22 12.5a10 10 0 0 1-18.8 4.2"></path></svg>
                            </button>
                        )}
                        {onDelete && (
                            <button onClick={() => onDelete(message)} className="p-1 rounded hover:bg-red-50 text-(--charcoal-700)/30 hover:text-red-500 transition-colors" title="删除">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}