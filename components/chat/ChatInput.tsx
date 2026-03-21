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
        <div className="pb-6 relative w-full flex justify-center drop-shadow-[0_12px_44px_rgba(0,0,0,0.06)]">
            <div className="w-full flex items-end gap-3 rounded-[32px] bg-(--paper-50)/80 border border-[rgba(248,245,238,0.3)] backdrop-blur-2xl p-2 pl-4 transition-all">

                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    rows={1}
                    className="max-h-40 min-h-[52px] flex-1 resize-none overflow-hidden bg-transparent py-4 text-[16px] font-serif leading-relaxed text-(--charcoal-700) outline-none placeholder:text-(--charcoal-700)/30 transition-all"
                    disabled={isLoading}
                />

                {isLoading && onStop ? (
                    <button
                        onClick={onStop}
                        className="mb-1.5 mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-400 hover:bg-red-500 text-white transition-all shadow-sm"
                        title="停止生成"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={!value.trim()}
                        className={`
                            mb-1.5 mr-1 flex h-11 w-11 shrink-0 items-center justify-center 
                            transition-all duration-300 rounded-full select-none
                            ${!value.trim() 
                                ? "bg-[rgba(226,220,203,0.4)] text-(--charcoal-700)/30" 
                                : "bg-(--caramel-500) text-white shadow-[0_4px_14px_rgba(201,42,42,0.3)] hover:scale-105 active:scale-95"}
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