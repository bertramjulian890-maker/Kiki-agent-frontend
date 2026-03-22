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
    placeholder = "给 Kiki 发送消息...",
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
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        await onSend(text);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void handleSubmit();
        }
    };

    return (
        <div className="pb-6 relative w-full flex justify-center" style={{ filter: 'drop-shadow(8px 12px 16px rgba(0,0,0,0.15))' }}>
            {/* 书签主体 */}
            <div className="w-11/12 md:w-full max-w-2xl flex flex-col gap-3 rounded-md bg-(--paper-50) border border-[rgba(0,0,0,0.05)] p-4 transition-all relative">

                {/* 顶部的书签孔/丝带装饰 (可选) */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-(--paper-50) border border-[rgba(0,0,0,0.05)] shadow-sm hidden"></div>

                <div className="flex items-end gap-3 w-full">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        rows={1}
                        className="max-h-40 min-h-[48px] flex-1 resize-none overflow-hidden bg-transparent py-2 px-1 text-[16px] font-serif leading-relaxed text-(--charcoal-700) outline-none placeholder:text-(--charcoal-700)/30 transition-all"
                        disabled={isLoading}
                    />

                    {isLoading && onStop ? (
                        <button
                            onClick={onStop}
                            className="mb-1 shrink-0 flex h-10 w-10 items-center justify-center rounded-sm bg-red-400/90 hover:bg-red-500 text-white transition-all shadow-sm"
                            title="停止生成"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!value.trim()}
                            className={`
                                mb-1 shrink-0 flex h-10 w-10 items-center justify-center
                                transition-all duration-300 rounded-sm select-none
                                ${!value.trim()
                                    ? "text-(--charcoal-700)/20"
                                    : "text-(--caramel-500) bg-(--caramel-500)/5 hover:bg-(--caramel-500)/10 hover:scale-105 active:scale-95"}
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
        </div>
    );
}