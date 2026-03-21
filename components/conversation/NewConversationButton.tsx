"use client";

interface NewConversationButtonProps {
    onClick: () => void;
}

export function NewConversationButton({ onClick }: NewConversationButtonProps) {
    return (
        <button
            onClick={onClick}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-(--caramel-500) text-white hover:opacity-90 transition-colors shadow-sm"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span className="text-sm font-medium">新对话</span>
        </button>
    );
}