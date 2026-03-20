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
                // 检查是否被取消
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
                    callbacks.onError?.(event.message ?? "流式输出失败");
                }
            }
        } catch (error) {
            // 如果是主动取消，不报错
            if (error instanceof DOMException && error.name === "AbortError") {
                console.log("流式输出已取消");
                return;
            }
            throw error;
        }
    };

    // 新增：启动新的 AbortController 并返回 signal
    const startAbort = useCallback(() => {
        abortRef.current = new AbortController();
        return abortRef.current.signal;
    }, []);

    const cancel = useCallback(() => {
        abortRef.current?.abort();
        abortRef.current = null;
    }, []);

    // 确保返回 startAbort
    return { consume, startAbort, cancel };
}