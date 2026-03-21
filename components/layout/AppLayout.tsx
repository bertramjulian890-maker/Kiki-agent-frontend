import { ReactNode } from "react";
import { SidebarToggleButton } from "@/components/ui/SidebarToggleButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface AppLayoutProps {
    sidebarContent: ReactNode;
    mainContent: ReactNode;
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
    onCloseSidebar: () => void;
}

export function AppLayout({
    sidebarContent,
    mainContent,
    isSidebarOpen,
    onToggleSidebar,
    onCloseSidebar,
}: AppLayoutProps) {
    return (
        <div className="fixed inset-0 flex overflow-hidden bg-(--paper-100) transition-colors duration-300">
            {/* 侧边栏 */}
            <div
                className={`fixed inset-y-0 left-0 z-40 w-72 bg-(--paper-100) transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {sidebarContent}
            </div>

            {/* 移动端遮罩 */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={onCloseSidebar}
                />
            )}

            {/* 主内容区及 Header */}
            <div className="flex-1 flex flex-col min-w-0 bg-(--paper-50) drop-shadow-[0_0_40px_rgba(0,0,0,0.01)] rounded-tl-none md:rounded-tl-3xl z-10 transition-colors duration-300">
                <header className="sticky top-0 z-20 bg-transparent transition-colors duration-300 pt-3">
                    <div className="mx-auto flex items-center justify-between px-6 py-3">
                        <div className="flex items-center gap-2">
                            <SidebarToggleButton isOpen={isSidebarOpen} onClick={onToggleSidebar} />
                        </div>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-hidden transition-colors duration-300">
                    {mainContent}
                </main>
            </div>
        </div>
    );
}
