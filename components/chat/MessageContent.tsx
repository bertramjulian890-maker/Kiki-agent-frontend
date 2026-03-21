"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageContentProps {
    content: string;
    isStreaming?: boolean;
    isUser?: boolean;
}

export function MessageContent({ content, isStreaming, isUser }: MessageContentProps) {
    return (
        <div
            className={`
                flex-1 w-full min-w-0 break-word
                prose prose-sm max-w-none 
                text-current
                /* 💡 呼吸感优化：增加段落间距，但保留紧凑性 */
                prose-p:text-current prose-p:my-1.5 prose-p:leading-relaxed
                prose-headings:text-current prose-headings:font-serif prose-headings:mb-2 prose-headings:mt-4
                prose-strong:text-current prose-strong:font-bold
                
                /* 💡 列表优化：红色的圆点与数字，更有书写感 */
                prose-ul:my-2 prose-ol:my-2
                ${isUser ? 'prose-li:marker:text-white/80' : 'prose-li:marker:text-(--caramel-500)'}
                
                /* 💡 表格优化：强制恢复边框与间距，解决截图里的错位问题 */
                prose-table:border-collapse prose-table:my-4
                prose-th:border prose-th:border-(--paper-300) prose-th:px-3 prose-th:py-2 prose-th:bg-(--paper-300)/50
                prose-td:border prose-td:border-(--paper-300) prose-td:px-3 prose-td:py-2
            `}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // 行内代码：改用更柔和的半透明背景
                    code({ className, children, ...props }) {
                        return (
                            <code
                                className={`px-1.5 py-0.5 rounded text-[0.9em] font-mono font-medium ${isUser
                                    ? 'bg-black/15 text-white'
                                    : 'bg-(--caramel-500)/10 text-(--caramel-600)'
                                    }`}
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },
                    // 代码块：改用深炭灰色背景，模拟打字机色带盒
                    pre({ children }) {
                        return (
                            <div className="relative group my-4">
                                <pre className={`p-4 rounded-xl overflow-x-auto text-sm font-mono shadow-sm border ${isUser
                                    ? 'bg-black/20 text-white border-white/10'
                                    : 'bg-(--charcoal-700) text-(--paper-100) border-(--paper-300)'
                                    }`}>
                                    {children}
                                </pre>
                            </div>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}