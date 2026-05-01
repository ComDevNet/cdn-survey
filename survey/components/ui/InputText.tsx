import React from "react";
import ValidationMessage from "./ValidationMessage";

interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export default function InputText({ error, label, ...props }: InputTextProps) {
  return (
    <div className="w-full flex flex-col pt-2 pb-2">
      <input
        {...props}
        className={`w-full bg-secondary border px-4 py-4 rounded-xl text-lg text-foreground 
        focus:outline-none focus:ring-2 focus:border-transparent transition-all
        ${error ? 'border-destructive focus:ring-destructive/50' : 'border-border focus:ring-primary/50'}`}
      />
      <ValidationMessage error={error} />
    </div>
  );
}
