"use client";

import { motion } from "framer-motion";

type StreamingTextProps = {
    text: string;
    isStreaming?: boolean;
};

export default function StreamingText({ text, isStreaming = false }: StreamingTextProps) {
    return (
        <div className="whitespace-pre-wrap break-words leading-7 text-[15px]">
            {text}
            {isStreaming && (
                <motion.span
                    className="ml-1 inline-block h-4 w-[2px] bg-[var(--caramel-500)] align-middle"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                />
            )}
        </div>
    );
}
