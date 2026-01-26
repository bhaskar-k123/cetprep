import { ReactNode } from "react";
import { Navbar } from "./Navbar";
interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="h-[100dvh] w-screen bg-background flex overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Navbar />
        <main className="flex-1 overflow-auto px-2 pt-0 pb-1">
          {children}
        </main>
      </div>
    </div>
  );
}
