"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { LoginScreen } from "./LoginScreen";
import { Spinner } from "./ui/Spinner";
import { AuroraBackground } from "./AuroraBackground";
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

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen bg-slate-950 relative">
        <AuroraBackground />
        <Sidebar user={user} onLogout={logout} />
        <motion.main
          className="flex-1 min-w-0 relative z-10"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {children}
        </motion.main>
      </div>
    </>
  );
}
