"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { LoginScreen } from "./LoginScreen";
import { Spinner } from "./ui/Spinner";
import { useUser } from "./UserProvider";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { user, authReady, logout } = useUser();

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Spinner size="lg" className="text-cyan-400" />
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <>
      {/* Mobile Navigation (hidden on lg and up) */}
      <div className="lg:hidden">
        <MobileNav onLogout={logout}>{children}</MobileNav>
      </div>

      {/* Desktop Layout (hidden on smaller screens) */}
      <div className="hidden lg:flex min-h-screen bg-slate-950">
        <Sidebar user={user} onLogout={logout} />
        <main className="flex-1 min-w-0 bg-slate-950">{children}</main>
      </div>
    </>
  );
}
