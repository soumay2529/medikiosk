import React from "react";
import { Check } from "lucide-react";

interface Step {
  id: string;
  label: string;
}

interface ProgressBarProps {
  currentStepIndex: number;
  steps: Step[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStepIndex, steps }) => {
  return (
    <nav aria-label="Progress" className="w-full py-2">
      <ol className="flex items-center justify-between gap-1 sm:gap-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <li key={step.id} className="flex-1 flex flex-col items-center group">
              <div className="flex items-center w-full">
                <div
                  className={`h-1.5 w-full transition-all ${
                    index === 0 ? "opacity-0" : isCompleted ? "bg-primary" : "bg-slate-200"
                  }`}
                />
                <div
                  className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${
                    isCompleted
                      ? "bg-primary border-primary text-white"
                      : isCurrent
                      ? "bg-white border-primary text-primary shadow-md ring-4 ring-primary/20 scale-110"
                      : "bg-slate-100 border-slate-300 text-slate-400"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" /> : index + 1}
                </div>
                <div
                  className={`h-1.5 w-full transition-all ${
                    index === steps.length - 1 ? "opacity-0" : isCompleted && index < currentStepIndex - 1 ? "bg-primary" : "bg-slate-200"
                  }`}
                />
              </div>
              <span
                className={`mt-1.5 text-xs text-center line-clamp-1 font-medium transition-colors ${
                  isCurrent ? "text-primary font-bold" : isCompleted ? "text-slate-700" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
