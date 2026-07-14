"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils/cn";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export function FloatingNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-3"
      aria-label="Navegação principal"
    >
      <div className="relative">
        <div
          className="pointer-events-none absolute -inset-10 -z-10 animate-glow-pulse rounded-full opacity-70 blur-2xl"
          style={{
            background:
              "radial-gradient(60% 140% at 50% 120%, rgba(182,130,53,0.35), transparent 70%)",
          }}
        />
        <div className="flex items-center gap-1 rounded-full border border-gold-500/25 bg-navy-900/90 p-1.5 shadow-floating backdrop-blur-xl">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex flex-col items-center gap-0.5 rounded-full px-3 py-2 text-[10px] tracking-wide transition-all duration-200 sm:px-4",
                  active
                    ? "-translate-y-1 bg-gold-500/25 text-white shadow-[inset_0_0_0_1px_rgba(182,130,53,0.55)]"
                    : "text-navy-100/70 hover:-translate-y-0.5 hover:bg-white/8 hover:text-white"
                )}
              >
                <Icon
                  className={cn("h-[18px] w-[18px] shrink-0", active && "drop-shadow-[0_0_6px_rgba(182,130,53,0.8)]")}
                  strokeWidth={1.75}
                />
                <span className="hidden sm:block">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
