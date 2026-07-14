import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <ol className="flex w-full items-center">
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const clickable = onStepClick && index <= currentStep;
        return (
          <li key={label} className={cn("flex items-center", index !== steps.length - 1 && "flex-1")}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick?.(index)}
              className={cn(
                "flex items-center gap-2.5 text-left",
                clickable ? "cursor-pointer" : "cursor-default"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                  isCompleted && "bg-navy-900 text-white",
                  isCurrent && "scale-110 bg-gold-500 text-white shadow-[0_0_0_4px_rgba(182,130,53,0.18),0_4px_16px_-2px_rgba(182,130,53,0.6)]",
                  !isCompleted && !isCurrent && "bg-mist-100 text-graphite-500"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:block",
                  isCurrent ? "text-navy-900" : isCompleted ? "text-graphite-700" : "text-graphite-500"
                )}
              >
                {label}
              </span>
            </button>
            {index !== steps.length - 1 && (
              <div className={cn("mx-3 h-px flex-1 transition-colors duration-300", isCompleted ? "bg-navy-900" : "bg-mist-200")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export { Stepper };
