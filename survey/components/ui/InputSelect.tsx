import React from "react";
import ValidationMessage from "./ValidationMessage";

interface InputSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: string[];
}

export default function InputSelect({ error, options, ...props }: InputSelectProps) {
  return (
    <div className="w-full flex flex-col pt-2 pb-2">
      <div className="relative">
        <select
          {...props}
          className={`appearance-none w-full bg-secondary border px-4 py-4 rounded-xl text-lg text-foreground 
          focus:outline-none focus:ring-2 focus:border-transparent transition-all cursor-pointer
          ${error ? 'border-destructive focus:ring-destructive/50' : 'border-border focus:ring-primary/50'}`}
        >
          <option value="" disabled>Select an option</option>
          {options.map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
          <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
      <ValidationMessage error={error} />
    </div>
  );
}
