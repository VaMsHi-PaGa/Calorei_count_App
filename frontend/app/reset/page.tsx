"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";

const ResetPasswordScreen = dynamic(
  () => import("@/components/ResetPasswordScreen").then((mod) => ({ default: mod.ResetPasswordScreen })),
  { ssr: false }
);

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" className="text-emerald-600" />
        </div>
      }
    >
      <ResetPasswordScreen />
    </Suspense>
  );
}
