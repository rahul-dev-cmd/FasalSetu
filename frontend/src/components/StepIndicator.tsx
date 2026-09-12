import React from 'react';
import { Check } from 'lucide-react';

export interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
  steps?: string[];
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  steps = ['Details', 'Photos', 'Review'],
  className = '',
}) => {
  return (
    <div className={`w-full py-2 ${className}`}>
      <div className="flex items-center justify-between max-w-sm mx-auto relative px-4">
        {/* Connector Line 1: Between Step 1 and Step 2 */}
        <div className="absolute top-4 left-[20%] right-[52%] h-0.5 bg-slate-200 -z-0">
          <div
            className={`h-full bg-primary transition-all duration-300 ${
              currentStep >= 2 ? 'w-full' : 'w-0'
            }`}
          />
        </div>

        {/* Connector Line 2: Between Step 2 and Step 3 */}
        <div className="absolute top-4 left-[52%] right-[20%] h-0.5 bg-slate-200 -z-0">
          <div
            className={`h-full bg-primary transition-all duration-300 ${
              currentStep >= 3 ? 'w-full' : 'w-0'
            }`}
          />
        </div>

        {steps.map((label, index) => {
          const stepNum = (index + 1) as 1 | 2 | 3;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div key={label} className="flex flex-col items-center relative z-10">
              {/* Step Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                  isCompleted
                    ? 'bg-primary text-white ring-2 ring-primary/20 shadow-xs'
                    : isActive
                    ? 'bg-primary text-white border-2 border-white ring-4 ring-primary/25 shadow-xs scale-105'
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <span>{stepNum}</span>
                )}
              </div>

              {/* Step Label */}
              <span
                className={`text-[11px] sm:text-xs mt-1.5 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'font-bold text-primary'
                    : isCompleted
                    ? 'font-semibold text-slate-700'
                    : 'font-medium text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
