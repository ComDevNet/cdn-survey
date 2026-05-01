import { useState, useEffect, useCallback, useRef } from "react";
import { Survey, SurveyField } from "../types/survey";

interface SurveyStateProps {
  survey: Survey | null;
  initialResponses?: Record<string, any>;
}

export function useSurveyState({ survey, initialResponses = {} }: SurveyStateProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>(initialResponses);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isOffline, setIsOffline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const responsesRef = useRef(initialResponses);

  // Check connection to server specifically (not just 'navigator.onLine')
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkServerConnection = async () => {
      try {
        const res = await fetch("/api/server-ping", { 
            method: "GET",
            headers: { 'Cache-Control': 'no-cache' } 
        });
        if (res.ok) {
          setIsOffline(false);
        } else {
          setIsOffline(true);
        }
      } catch (err) {
        setIsOffline(true);
      }
    };

    checkServerConnection();
    intervalId = setInterval(checkServerConnection, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const totalSteps = survey?.formFields?.length || 0;
  const currentField = survey?.formFields?.[currentStep];

  const validateField = (field: SurveyField, value: any): string => {
    if (field.required && (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0))) {
      return "This question is required.";
    }
    if (field.type === "email" && value && !/\S+@\S+\.\S+/.test(value)) {
      return "Please enter a valid email address.";
    }
    return "";
  };

  const handleResponseChange = useCallback((value: any) => {
    if (!currentField) return;
    setResponses((prev) => {
      const next = {
        ...prev,
        [currentField.question]: value,
      };
      responsesRef.current = next;
      return next;
    });
    // Clear error inline as they type
    if (errors[currentField.question]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[currentField.question];
        return newErrors;
      });
    }
  }, [currentField, errors]);

  const validateCurrentStep = (): boolean => {
    if (!currentField) return true;
    const error = validateField(currentField, responsesRef.current[currentField.question]);
    if (error) {
      setErrors((prev) => ({ ...prev, [currentField.question]: error }));
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) { // allow going exactly to totalSteps for ReviewScreen
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const setStep = (step: number) => {
    setCurrentStep(step);
  };

  const isReviewStep = currentStep === totalSteps;

  return {
    currentStep,
    totalSteps,
    currentField,
    responses,
    errors,
    isOffline,
    isSubmitting,
    setIsSubmitting,
    handleResponseChange,
    nextStep,
    prevStep,
    setStep,
    validateCurrentStep,
    isReviewStep
  };
}
