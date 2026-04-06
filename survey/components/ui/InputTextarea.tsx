import React from "react";
import ValidationMessage from "./ValidationMessage";

interface InputTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export default function InputTextarea({ error, ...props }: InputTextareaProps) {
  return (
    <div className="w-full flex flex-col pt-2 pb-2">
      <textarea
        {...props}
        rows={4}
        className={`w-full bg-secondary border px-4 py-4 rounded-xl text-lg text-foreground 
        focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-y
        ${error ? 'border-destructive focus:ring-destructive/50' : 'border-border focus:ring-primary/50'}`}
      />
      <ValidationMessage error={error} />
    </div>
  );
}
