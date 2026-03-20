"use client";

interface SidebarToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function SidebarToggleButton({
  isOpen,
  onClick,
  className,
}: SidebarToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg hover:bg-(--paper-200) transition-colors ${className}`}
      title={isOpen ? "收起侧边栏" : "展开侧边栏"}
    >
      {isOpen ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-(--charcoal-700)"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-(--charcoal-700)"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      )}
    </button>
  );
}
