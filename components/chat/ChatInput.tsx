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
        <div className="pb-6 relative w-full flex justify-center drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)]">
            {/* 书签主体 */}
            <div className="w-full flex items-end gap-3 bg-(--bookmark) border border-black/10 backdrop-blur-md p-3 pl-5 transition-all
                rounded-md shadow-lg"
                 style={{
                     // 给书签添加一点纸张纹理
                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`
                 }}
            >
                {/* 装饰性丝带/孔 (可选) */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-(--bookmark) border-x border-t border-black/10 rounded-t-md flex justify-center items-center shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-black/20" />
                </div>

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
                                ? "text-(--charcoal-700)/20" 
                                : "text-(--caramel-500) hover:opacity-100 hover:scale-110 active:scale-95"}
                        `}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`${value.trim() ? "translate-x-[-1px] translate-y-[1px]" : ""}`}>
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}