import React from "react";
import ValidationMessage from "./ValidationMessage";

interface InputRadioGroupProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export default function InputRadioGroup({ options, value, onChange, error }: InputRadioGroupProps) {
  return (
    <div className="w-full pt-2 pb-2">
      <div className="flex flex-col space-y-3">
        {options.map((opt, i) => {
          const isSelected = value === opt;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(opt)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center justify-between
                ${isSelected 
                  ? 'border-primary bg-primary/5 shadow-sm' 
                  : 'border-border bg-card hover:border-primary/50 hover:bg-secondary'}
                ${error ? 'border-destructive/50' : ''}`}
            >
              <span className={`text-lg font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                {opt}
              </span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-4 transition-colors
                ${isSelected ? 'border-primary' : 'border-muted-foreground'}`}
              >
                {isSelected && <div className="w-3 h-3 rounded-full bg-primary animate-pop-in" />}
              </div>
            </button>
          );
        })}
      </div>
      <ValidationMessage error={error} />
    </div>
  );
}
