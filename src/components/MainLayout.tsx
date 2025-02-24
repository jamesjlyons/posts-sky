"use client";

import { useCurrentProfile } from "../app/hooks/use-profile";
import { useAuth } from "../app/hooks/use-auth";
import { SideNav } from "./SideNav";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated, handleLogout } = useAuth();
  const { data: profile } = useCurrentProfile(isAuthenticated);

  return (
    <div className="grid grid-cols-[minmax(60px,_300px)_604px_300px] max-[800px]:grid-cols-[60px_1fr] w-full max-w-[calc(300px+604px+300px)] max-[800px]:max-w-none mx-auto min-h-screen">
      <SideNav profile={profile} />
      <main className="feed border-x border-border-primary">{children}</main>
      <Sidebar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
    </div>
  );
}
