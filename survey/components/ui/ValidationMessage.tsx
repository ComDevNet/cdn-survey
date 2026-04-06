import React from "react";
import { FiAlertCircle } from "react-icons/fi";

interface ValidationMessageProps {
  error?: string;
}

export default function ValidationMessage({ error }: ValidationMessageProps) {
  if (!error) return null;

  return (
    <div className="flex items-center text-destructive text-sm mt-3 animate-pop-in bg-destructive/10 px-3 py-2 rounded-md">
      <FiAlertCircle className="mr-2" size={16} />
      <span>{error}</span>
    </div>
  );
}
