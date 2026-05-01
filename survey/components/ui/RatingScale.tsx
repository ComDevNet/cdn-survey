import React from "react";
import ValidationMessage from "./ValidationMessage";

interface RatingScaleProps {
  maxRating?: number;
  value: number | undefined;
  onChange: (val: number) => void;
  error?: string;
}

export default function RatingScale({ maxRating = 10, value, onChange, error }: RatingScaleProps) {
  const options = Array.from({ length: maxRating }, (_, i) => i + 1);

  return (
    <div className="w-full pt-2 pb-2">
      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-2">
        {options.map((num) => {
          const isSelected = value === num;
          return (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className={`w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center rounded-xl border-2 text-xl font-bold transition-all shadow-sm
                ${isSelected 
                  ? 'border-primary bg-primary text-primary-foreground transform scale-105 animate-pop-in' 
                  : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary'}
                ${error ? 'border-destructive/50' : ''}`}
            >
              {num}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between w-full px-2 mt-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
        <span>Not Likely</span>
        <span>Very Likely</span>
      </div>
      <div className="mt-4">
         <ValidationMessage error={error} />
      </div>
    </div>
  );
}
