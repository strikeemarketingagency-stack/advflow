import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ice-50",
  {
    variants: {
      variant: {
        primary:
          "bg-navy-900 text-white shadow-soft hover:bg-navy-800 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(182,130,53,0.35),0_10px_28px_-6px_rgba(182,130,53,0.55)] active:scale-[0.98] active:translate-y-0 active:bg-navy-950",
        secondary:
          "bg-white text-navy-900 border border-mist-200 shadow-soft hover:bg-ice-100 hover:border-gold-300 hover:-translate-y-0.5 hover:shadow-hover active:scale-[0.98] active:translate-y-0",
        ghost: "text-graphite-700 hover:bg-mist-100 hover:text-navy-900",
        gold: "bg-gold-500 text-white shadow-soft hover:bg-gold-400 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(182,130,53,0.45),0_12px_32px_-6px_rgba(182,130,53,0.65)] active:scale-[0.98] active:translate-y-0",
        danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50",
        link: "text-navy-800 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 shrink-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, children, disabled, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
