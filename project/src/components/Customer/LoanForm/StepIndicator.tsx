import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: Array<{
    name: string;
    description: string;
  }>;
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
        {steps.map((step, index) => (
          <li key={step.name} className="md:flex-1">
            <div className="group flex flex-col border-l-4 border-blue-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
              <span className="flex items-center text-sm font-medium">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  index < currentStep
                    ? 'bg-blue-600 text-white'
                    : index === currentStep
                    ? 'border-2 border-blue-600 text-blue-600'
                    : 'border-2 border-gray-300 text-gray-500'
                } mr-2`}>
                  {index < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </span>
                <span className={`${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
              </span>
              <span className="ml-8 mt-0.5 text-xs text-gray-500">
                {step.description}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default StepIndicator;