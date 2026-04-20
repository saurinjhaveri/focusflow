import { SideNav } from "./side-nav";
import { BottomNav } from "./bottom-nav";
import { TopBar } from "./top-bar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh bg-background">
      {/* Desktop: Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <SideNav />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar (mobile title + settings link) */}
        <TopBar />

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto"
          id="main-content"
          tabIndex={-1}
        >
          {/* Mobile: bottom nav padding; Desktop: no padding needed */}
          <div className="pb-20 md:pb-0">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile: Bottom nav */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
