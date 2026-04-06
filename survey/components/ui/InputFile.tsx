import React, { useState } from "react";
import ValidationMessage from "./ValidationMessage";
import { FiUploadCloud, FiCheckCircle } from "react-icons/fi";

interface InputFileProps {
  error?: string;
  onChange: (file: File | null) => void;
  value?: File | null | { name: string, url: string };
}

export default function InputFile({ error, onChange, value }: InputFileProps) {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  const hasFile = !!value;
  const fileName = value instanceof File ? value.name : value?.name;

  return (
    <div className="w-full flex flex-col pt-2 pb-2">
      <label className={`
        relative flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed
        rounded-2xl cursor-pointer transition-all duration-300 group overflow-hidden
        ${error ? 'border-destructive bg-destructive/5' : 'border-border bg-card hover:border-primary/50 hover:bg-secondary'}
        ${hasFile ? 'border-primary bg-primary/5' : ''}
      `}>
        <div className="flex flex-col items-center justify-center p-6 text-center z-10 w-full h-full text-foreground">
          {hasFile ? (
            <>
               <FiCheckCircle className="w-10 h-10 mb-3 text-primary animate-pop-in" />
               <p className="font-semibold text-lg max-w-full truncate px-4">{fileName}</p>
               <p className="text-sm text-primary mt-2 group-hover:underline">Tap to change file</p>
            </>
          ) : (
            <>
               <FiUploadCloud className="w-10 h-10 mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
               <p className="font-semibold text-lg text-foreground">Tap to upload a file</p>
               <p className="text-sm text-muted-foreground mt-1">Image, PDF, or Document</p>
            </>
          )}
        </div>
        <input 
          type="file" 
          className="hidden" 
          onChange={handleFileChange}
        />
      </label>
      <ValidationMessage error={error} />
    </div>
  );
}
