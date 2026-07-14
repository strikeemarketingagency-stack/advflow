import { cn } from "@/lib/utils/cn";

function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="11" fill="currentColor" className="text-navy-900" />
      <path
        d="M10 22.5L15 9.5H17.4L22.4 22.5H19.9L18.75 19.3H13.6L12.45 22.5H10ZM14.3 17.2H18.05L16.2 12L14.3 17.2Z"
        fill="url(#advflow-gold)"
      />
      <defs>
        <linearGradient id="advflow-gold" x1="10" y1="9.5" x2="22.4" y2="22.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D9BE8A" />
          <stop offset="1" stopColor="#B7995C" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Logo({ className, iconClassName, wordmarkClassName }: { className?: string; iconClassName?: string; wordmarkClassName?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={cn("h-8 w-8", iconClassName)} />
      <span className={cn("font-display text-lg font-semibold tracking-tight text-navy-900", wordmarkClassName)}>
        Adv<span className="text-gold-500">Flow</span>
      </span>
    </div>
  );
}

export { Logo, LogoMark };
