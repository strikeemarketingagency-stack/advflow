export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(55% 45% at 15% 10%, rgba(182,130,53,0.22) 0%, rgba(23,21,15,0) 70%), radial-gradient(45% 45% at 100% 100%, rgba(182,130,53,0.16) 0%, rgba(23,21,15,0) 70%)",
        }}
      />
      <div
        aria-hidden
        className="font-display pointer-events-none absolute -right-16 -top-24 select-none text-[520px] font-normal leading-none text-gold-500 opacity-[0.07]"
      >
        A
      </div>
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
