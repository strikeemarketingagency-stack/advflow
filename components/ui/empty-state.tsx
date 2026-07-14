import * as React from "react";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-mist-200 bg-white/60 px-6 py-16 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-gold-200 bg-gradient-to-br from-ice-100 to-mist-100 text-navy-800">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-navy-900">{title}</p>
        {description && <p className="max-w-sm text-sm text-graphite-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export { EmptyState };
