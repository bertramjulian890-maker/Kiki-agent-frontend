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
                        className="
                                    mb-1 flex h-10 w-10 shrink-0 items-center justify-center 
                                    text-(--caramel-500) transition-all duration-300
                                    hover:scale-110 active:scale-95
                                    disabled:opacity-30 disabled:hover:scale-100
                                "
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-[-8deg] ml-0.5 mt-0.5">
                            <path d="M10 14l11 -11" />
                            <path d="M21 3l-6.5 18a0.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a0.55 .55 0 0 1 0 -1l18 -6.5" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}