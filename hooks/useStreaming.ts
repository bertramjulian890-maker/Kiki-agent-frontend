"use client";

import { useRef, useCallback } from "react";
// 注意：记得在 types/chat.ts 中把 StreamChunk 的类型拓展，允许它包含 tool 和 event 等字段
import type { StreamChunk } from "@/types/chat";

type StreamingCallbacks = {
    onStart?: () => void;
    // 🚀 核心修改 1：把 onChunk(text: string) 改为 onData(event: any)，把整个对象抛给上层
    onData?: (event: any) => void;
    onEnd?: (finalText: string) => void;
    onError?: (message: string) => void;
};

export function useStreaming() {
    const abortRef = useRef<AbortController | null>(null);

    const consume = async (
        stream: AsyncGenerator<StreamChunk, void, unknown>,
        callbacks: StreamingCallbacks
    ) => {
        let finalText = "";

        try {
            for await (const event of stream) {
                console.log("收到原始事件:", event);
                // 如果发现外部主动触发了 abort，立刻跳出流循环
                if (abortRef.current?.signal.aborted) {
                    break;
                }

                // 🚀 核心修改 2：无论是什么类型的事件（chunk/event/tool），统统交给 useChat 调度
                callbacks.onData?.(event);

                if (event.type === "start") {
                    callbacks.onStart?.();
                }

                // 记录文本拼接，为最终保存做准备
                if (event.type === "chunk") {
                    const piece = event.content ?? "";
                    finalText += piece;
                }

                if (event.type === "end" || event.type === "done") {
                    callbacks.onEnd?.(event.fullResponse ?? finalText);
                }

                if (event.type === "error") {
                    callbacks.onError?.(event.message ?? "流式输出后端返回异常");
                }
            }
        } catch (error: any) {
            // 静默处理主动取消的错误（Fetch 请求中止会抛出 AbortError）
            if (error.name === "AbortError" || abortRef.current?.signal.aborted) {
                console.log("⏸️ 流式输出已由用户主动取消");
                return;
            }
            console.error("❌ 流式请求捕获到未预期错误:", error);
            callbacks.onError?.(error.message || "请求发生未知异常");
        } finally {
            // 清理状态
            abortRef.current = null;
        }
    };

    const startAbort = useCallback(() => {
        // 在发起新请求前，先取消上一次可能还在进行的请求
        if (abortRef.current) {
            abortRef.current.abort();
        }
        abortRef.current = new AbortController();
        return abortRef.current.signal;
    }, []);

    const cancel = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
    }, []);

    return { consume, startAbort, cancel };
}