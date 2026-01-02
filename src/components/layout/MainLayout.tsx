
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
    children: ReactNode;
    sidebar: ReactNode;
    sidebarCollapsed: boolean;
}

export function MainLayout({ children, sidebar, sidebarCollapsed }: MainLayoutProps) {
    return (
        <div
            className="grid h-[100dvh] w-full bg-background overflow-hidden transition-[grid-template-columns] duration-300 ease-out"
            style={{
                gridTemplateColumns: sidebarCollapsed ? '4rem minmax(0, 1fr)' : '16rem minmax(0, 1fr)',
                gridTemplateAreas: '"sidebar main"'
            }}
        >
            {/* Sidebar Area - Wrapper */}
            <div
                className="relative z-40 h-full overflow-hidden"
                style={{ gridArea: 'sidebar' }}
            >
                {sidebar}
            </div>

            {/* Main Content Area */}
            <main
                data-scroll-container
                className="@container relative flex min-w-0 flex-col overflow-y-auto overflow-x-hidden h-full"
                style={{ gridArea: 'main' }}
            >
                {children}
            </main>
        </div>
    );
}
