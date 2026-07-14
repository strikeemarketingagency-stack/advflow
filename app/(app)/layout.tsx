"use client";

import * as React from "react";
import { AuthGuard } from "@/components/layout/auth-guard";
import { FloatingNav } from "@/components/layout/floating-nav";
import { Topbar } from "@/components/layout/topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard mode="app">
      <div className="min-h-screen bg-ice-50">
        <div className="flex min-h-screen flex-col">
          <Topbar />
          <main className="flex-1 px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-36 lg:pt-8">{children}</main>
        </div>
        <FloatingNav />
      </div>
    </AuthGuard>
  );
}
