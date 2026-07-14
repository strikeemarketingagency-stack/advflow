"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-provider";
import { officeRepo } from "@/lib/repositories";
import { FullPageLoader } from "@/components/layout/full-page-loader";

interface AuthGuardProps {
  mode: "app" | "onboarding";
  children: React.ReactNode;
}

export function AuthGuard({ mode, children }: AuthGuardProps) {
  const { status } = useAuth();
  const router = useRouter();
  const [allowed, setAllowed] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    officeRepo.get().then((office) => {
      if (!active) return;
      const complete = office?.onboardingComplete ?? false;
      if (mode === "app" && !complete) {
        router.replace("/onboarding");
      } else if (mode === "onboarding" && complete) {
        router.replace("/dashboard");
      } else {
        setAllowed(true);
      }
    });
    return () => {
      active = false;
    };
  }, [status, mode, router]);

  if (!allowed) return <FullPageLoader />;
  return <>{children}</>;
}
