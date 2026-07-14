import { AuthGuard } from "@/components/layout/auth-guard";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard mode="onboarding">
      <div className="relative min-h-screen overflow-hidden bg-ice-50 px-4 py-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(50% 40% at 50% 0%, rgba(182,130,53,0.10) 0%, rgba(243,242,242,0) 70%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-2xl">{children}</div>
      </div>
    </AuthGuard>
  );
}
