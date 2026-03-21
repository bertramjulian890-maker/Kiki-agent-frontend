"use client";

import { useRef, useState, useCallback } from "react";

interface ChatInputProps {
    isLoading: boolean;
    onSend: (value: string) => Promise<void>;
    onStop?: () => void;
    placeholder?: string;
}

export function ChatInput({
    isLoading,
    onSend,
    onStop,
    placeholder = "输入消息...",
}: ChatInputProps) {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const resizeTextarea = useCallback(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
        resizeTextarea();
    };

    const handleSubmit = async () => {
        if (!value.trim() || isLoading) return;
        const text = value.trim();
        setValue("");
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
        await onSend(text);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void handleSubmit();
        }
    };

    return (
        <div className="bg-(--paper-100) px-4 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-4 z-10">
            <div className="mx-auto flex w-full max-w-2xl items-end gap-2 rounded-[28px] border border-(--paper-300) bg-(--paper-100) p-1.5 transition-all dark:bg-transparent">

                {/* 💡 修复：恢复输入框的宽敞内边距和 16px 字体 */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    rows={1}
                    className="max-h-40 min-h-[48px] flex-1 resize-none overflow-hidden bg-transparent pl-4 pr-2 py-3 text-[16px] leading-relaxed text-(--charcoal-700) outline-none placeholder:text-(--charcoal-700)/40 transition-all"
                    disabled={isLoading}
                />

                {/* 💡 修复：将按钮恢复为正圆形，提升精致感 */}
                {isLoading && onStop ? (
                    <button
                        onClick={onStop}
                        className="mb-1 mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                        title="停止生成"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={!value.trim()}
                        className={`
                            mb-1 flex h-10 w-10 shrink-0 items-center justify-center 
                            transition-all duration-300 rounded-full
                            ${!value.trim() 
                                ? "text-(--caramel-500)/40 hover:text-(--caramel-500)/60" 
                                : "text-(--paper-100) bg-(--caramel-500) hover:bg-(--caramel-600) shadow-sm hover:scale-105 active:scale-95"}
                        `}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`${value.trim() ? "translate-x-[-1px] translate-y-[1px]" : ""}`}>
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}