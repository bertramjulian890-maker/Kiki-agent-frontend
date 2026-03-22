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
        <div className="fixed inset-0 flex overflow-hidden bg-leather p-2 md:p-6 lg:p-8 transition-colors duration-300">
            {/* 内部主容器（书本主体） */}
            <div className="flex flex-1 overflow-hidden rounded-[24px] bg-(--paper-100) drop-shadow-2xl relative">

                {/* 物理天头模拟 (The Head) */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-(--paper-200) z-30 book-top-edge pointer-events-none rounded-t-[24px]"></div>

                {/* 侧边栏 */}
                <div
                    className={`fixed inset-y-0 left-0 z-40 w-72 bg-(--paper-100) transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block ${
                        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } mt-2`}
                >
                    {sidebarContent}
                </div>

                {/* 移动端遮罩 */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden rounded-[24px]"
                        onClick={onCloseSidebar}
                    />
                )}

                {/* 主内容区及 Header */}
                <div className="flex-1 flex flex-col min-w-0 bg-(--paper-50) drop-shadow-[0_0_40px_rgba(0,0,0,0.02)] md:rounded-tl-[24px] z-10 transition-colors duration-300 relative mt-2 border-l border-black/5 dark:border-white/5">

                    {/* 书脊阴影模拟 (Gutter) */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none z-20"></div>

                    <header className="sticky top-0 z-20 bg-transparent transition-colors duration-300 pt-4">
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
        </div>
    );
}
