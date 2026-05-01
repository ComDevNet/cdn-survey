import React from "react";
import { SurveyField } from "../../types/survey";

interface QuestionCardProps {
  field: SurveyField;
  children: React.ReactNode;
}

export default function QuestionCard({ field, children }: QuestionCardProps) {
  return (
    <div className="w-full max-w-lg mx-auto bg-card rounded-2xl shadow-sm border p-6 md:p-8 animate-slide-in-right">
      <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2 text-foreground break-words relative">
        {field.question}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </h2>
      <div className="mt-8">
        {children}
      </div>
    </div>
  );
}
