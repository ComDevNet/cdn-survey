import React from "react";
import ValidationMessage from "./ValidationMessage";
import { FiCheck } from "react-icons/fi";

interface InputCheckboxGroupProps {
  options: string[];
  values: string[];
  onChange: (vals: string[]) => void;
  error?: string;
}

export default function InputCheckboxGroup({ options, values = [], onChange, error }: InputCheckboxGroupProps) {
  const toggleOption = (opt: string) => {
    if (values.includes(opt)) {
      onChange(values.filter(v => v !== opt));
    } else {
      onChange([...values, opt]);
    }
  };

  return (
    <div className="w-full pt-2 pb-2">
      <div className="flex flex-col space-y-3">
        {options.map((opt, i) => {
          const isSelected = values.includes(opt);
          return (
             <button
              key={i}
              type="button"
              onClick={() => toggleOption(opt)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center justify-between
                ${isSelected 
                  ? 'border-primary bg-primary/5 shadow-sm' 
                  : 'border-border bg-card hover:border-primary/50 hover:bg-secondary'}
                ${error ? 'border-destructive/50' : ''}`}
             >
               <span className={`text-lg font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                 {opt}
               </span>
               <div className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 ml-4 transition-colors
                 ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'}`}
               >
                 {isSelected && <FiCheck className="text-primary-foreground animate-pop-in" size={16} />}
               </div>
             </button>
          );
        })}
      </div>
      <ValidationMessage error={error} />
    </div>
  );
}
