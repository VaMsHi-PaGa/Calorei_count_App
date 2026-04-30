"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { useUser } from "@/components/UserProvider";
import { Spinner } from "@/components/ui/Spinner";

export default function OnboardingPage() {
  const { user, authReady } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.onboarding_complete) {
      router.replace("/");
    }
  }, [authReady, user, router]);

  if (!authReady || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <Spinner size="lg" className="text-cyan-400" />
      </div>
    );
  }

  return <OnboardingWizard userEmail={user.email} />;
}
