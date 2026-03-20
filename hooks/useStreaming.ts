"use client";

import { useRef, useCallback } from "react";
import type { StreamChunk } from "@/types/chat";

type StreamingCallbacks = {
    onStart?: () => void;
    onChunk?: (text: string) => void;
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
                // 如果发现外部主动触发了 abort，立刻跳出流循环
                if (abortRef.current?.signal.aborted) {
                    break;
                }

                if (event.type === "start") {
                    callbacks.onStart?.();
                }

                if (event.type === "chunk") {
                    const piece = event.content ?? "";
                    finalText += piece;
                    callbacks.onChunk?.(piece);
                }

                if (event.type === "end") {
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