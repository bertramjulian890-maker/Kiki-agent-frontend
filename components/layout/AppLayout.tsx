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
        <div className="fixed inset-0 flex p-1 sm:p-2 md:p-3 overflow-hidden transition-colors duration-300">
            {/* 书本内页容器 */}
            <div className="flex-1 flex flex-col relative w-full h-full bg-(--book-pages) rounded-sm md:rounded-md shadow-[inset_0_0_15px_rgba(0,0,0,0.1),0_0_20px_rgba(0,0,0,0.2)] overflow-hidden">

                {/* 模拟天头（顶部书页侧面堆叠纹理） */}
                <div className="absolute top-0 left-0 right-0 h-4 md:h-6 pointer-events-none z-30
                    bg-[repeating-linear-gradient(to_bottom,transparent,transparent_1px,rgba(0,0,0,0.03)_1px,rgba(0,0,0,0.03)_2px)]
                    shadow-[inset_0_4px_6px_rgba(0,0,0,0.05)] border-b border-black/5 opacity-80"
                />

                {/* 天头下方的渐变阴影，增加立体感 */}
                <div className="absolute top-4 md:top-6 left-0 right-0 h-6 bg-gradient-to-b from-black/10 to-transparent pointer-events-none z-20" />

                <div className="flex-1 flex flex-row mt-4 md:mt-6 h-[calc(100%-1rem)] md:h-[calc(100%-1.5rem)] relative">
                    {/* 左侧书页边缘露出（极窄的一条） */}
                    <div className="hidden md:block w-1 h-full bg-gradient-to-r from-black/5 to-transparent border-r border-black/5 pointer-events-none z-10" />

                    {/* 侧边栏 */}
                    <div
                        className={`fixed inset-y-0 left-0 z-40 w-72 bg-(--paper-100) transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block border-r border-black/5 ${
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

                    {/* 中缝阴影 (书本中间的凹陷) */}
                    <div className="hidden md:block w-8 h-full bg-gradient-to-r from-black/10 via-black/5 to-transparent pointer-events-none absolute left-72 z-20" style={{ transform: 'translateX(-50%)' }} />

                    {/* 主内容区及 Header */}
                    <div className="flex-1 flex flex-col min-w-0 bg-(--paper-50) drop-shadow-[0_0_40px_rgba(0,0,0,0.01)] z-10 transition-colors duration-300 relative">
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

                        <main className="flex-1 overflow-hidden transition-colors duration-300 relative">
                            {mainContent}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}
