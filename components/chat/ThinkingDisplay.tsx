"use client";

import React from 'react';

interface ThinkingDisplayProps {
    thinkingMessage?: string;
}

export function ThinkingDisplay({ thinkingMessage }: ThinkingDisplayProps) {
    return (
        <div className="flex items-center gap-2.5 px-1 py-1.5 font-retro-serif select-none">
            {/* 🚀 呼吸的核心：动画点 */}
            <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-(--charcoal-700)/50 animate-breath-slow delay-0"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-(--charcoal-700)/50 animate-breath-slow delay-150"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-(--charcoal-700)/50 animate-breath-slow delay-300"></span>
            </div>

            {/* 思考文字 */}
            <span className="text-sm text-(--charcoal-700)/50 italic animate-breath-slow">
                {thinkingMessage || "Kiki 正在思考..."}
            </span>
        </div>
    );
}