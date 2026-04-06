interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  // Prevent division by zero and cap at 100%
  const progressPercent = totalSteps > 0 
    ? Math.min(100, Math.max(0, (currentStep / totalSteps) * 100))
    : 0;
    
  return (
    <div className="w-full max-w-lg mx-auto mb-8 px-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {currentStep === totalSteps ? "Review" : `Question ${currentStep + 1} of ${totalSteps}`}
        </span>
        <span className="text-sm font-bold text-primary">
          {Math.round(progressPercent)}%
        </span>
      </div>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out flex items-center justify-end"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
