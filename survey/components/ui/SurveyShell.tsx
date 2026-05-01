import React from "react";
import ProgressIndicator from "./ProgressIndicator";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

interface SurveyShellProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  children: React.ReactNode;
  title: string;
}

export default function SurveyShell({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  canGoNext,
  children,
  title
}: SurveyShellProps) {
  
  return (
    <div className="min-h-screen bg-background flex flex-col pt-16 md:pt-24 pb-32 md:pb-40 px-4 select-none relative w-full overflow-x-hidden">
      <div className="w-full max-w-lg mx-auto mb-8 text-center px-4">
        <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">
          {title}
        </h1>
      </div>
      
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      
      {/* The main content area */}
      <div className="flex-grow flex flex-col justify-start relative w-full">
         {children}
      </div>

      {/* Floating Action Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-card border-t p-4 md:p-6 pb-6 md:pb-8 flex justify-between items-center z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="max-w-3xl w-full mx-auto flex justify-between px-2 md:px-0">
          <button
            onClick={onPrev}
            disabled={currentStep === 0}
            className={`flex items-center justify-center p-4 rounded-xl font-bold transition-all text-lg
              ${currentStep === 0 
                ? 'opacity-0 pointer-events-none' 
                : 'bg-secondary text-foreground hover:bg-secondary/80'}`}
            aria-label="Previous question"
          >
            <FiArrowLeft size={24} className="mr-2" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {currentStep < totalSteps && (
            <button
              onClick={onNext}
              className={`flex items-center justify-center py-4 px-8 rounded-xl font-bold transition-all text-lg flex-1 max-w-[200px] ml-4
                ${canGoNext 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transform hover:scale-[1.02]' 
                  : 'bg-secondary text-muted-foreground'}`}
              aria-label="Next question"
            >
              <span className="mr-2 text-xl tracking-wide">Next</span>
              <FiArrowRight size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
