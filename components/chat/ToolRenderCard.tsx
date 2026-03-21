import React from 'react';

export interface ToolRenderCardProps {
    toolName: string;
    toolInput: any;
    status: 'running' | 'completed' | 'error';
    output?: any;
}

export function ToolRenderCard({ toolName, toolInput, status, output }: ToolRenderCardProps) {
    // 根据状态显示不同视觉
    const isRunning = status === 'running';
    
    return (
        <div className="my-2 p-4 rounded-xl bg-(--paper-200) border border-(--paper-300) text-sm shadow-sm transition-all">
            <div className="flex items-center gap-2 mb-2 text-(--charcoal-600) font-medium">
                {isRunning && <span className="animate-spin inline-block">⚙️</span>}
                {status === 'completed' && <span className="text-green-500">✓</span>}
                {status === 'error' && <span className="text-(--primary-500)">✗</span>}
                <span>调用工具: <span className="font-semibold text-(--primary-500)">{toolName}</span></span>
            </div>
            <div className="text-(--charcoal-500) font-mono text-xs overflow-x-auto bg-(--paper-100) p-2 rounded-lg">
                <p>输入参数: {typeof toolInput === 'string' ? toolInput : JSON.stringify(toolInput)}</p>
            </div>
        </div>
    );
}
