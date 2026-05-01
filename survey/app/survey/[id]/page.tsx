"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Survey } from "../../../types/survey";

// Hooks
import { useSurveyState } from "../../../hooks/useSurveyState";

// Components
import SurveyShell from "../../../components/ui/SurveyShell";
import QuestionCard from "../../../components/ui/QuestionCard";
import NetworkStatusBanner from "../../../components/ui/NetworkStatusBanner";
import LoadingState from "../../../components/ui/LoadingState";
import SurveyCompletionScreen from "../../../components/ui/SurveyCompletionScreen";
import ReviewScreen from "../../../components/ui/ReviewScreen";

// Inputs
import InputText from "../../../components/ui/InputText";
import InputTextarea from "../../../components/ui/InputTextarea";
import InputRadioGroup from "../../../components/ui/InputRadioGroup";
import InputCheckboxGroup from "../../../components/ui/InputCheckboxGroup";
import InputSelect from "../../../components/ui/InputSelect";
import RatingScale from "../../../components/ui/RatingScale";
import InputFile from "../../../components/ui/InputFile";

export default function SurveyPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/surveys/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load");
          return res.json();
        })
        .then((data) => {
          setSurvey(data);
          setIsFetching(false);
        })
        .catch(() => {
          setFetchError("Failed to load survey. Please check your connection.");
          setIsFetching(false);
        });
    }
  }, [id]);

  const surveyState = useSurveyState({ survey: survey as Survey });

  if (isFetching) {
    return (
      <div className="min-h-screen pt-24 bg-background">
        <LoadingState />
      </div>
    );
  }

  if (fetchError || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
        <div>
          <h2 className="text-2xl font-bold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground mb-6">{fetchError || "Survey not found."}</p>
          <button 
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-secondary text-foreground rounded-xl hover:bg-secondary/80"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen pt-24 bg-background px-4">
        <SurveyCompletionScreen onReturnHome={() => router.push("/")} />
      </div>
    );
  }

  const {
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
  } = surveyState;

  const handleSubmit = async () => {
    // Cannot submit if offline
    if (isOffline) return;

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      for (const field of survey.formFields) {
        const responseValue = responses[field.question];
        if (Array.isArray(responseValue)) {
          formData.append(field.question, responseValue.length > 0 ? responseValue.join(", ") : "");
        } else if (field.type === "file" && responseValue?.url) {
          formData.append(field.question, responseValue.url);
        } else {
          formData.append(field.question, String(responseValue || ""));
        }
      }

      const response = await fetch(`/api/surveys/${id}/results`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setIsCompleted(true);
      } else {
        alert("Failed to submit survey. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Only upload if connected
    if (isOffline) {
       alert("Files cannot be uploaded while offline. Please connect and try again.");
       return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        handleResponseChange({ name: file.name, url: data.url });
      } else {
        alert("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred during file upload");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextWithAutoAdvance = (type: string) => {
    return (val: any) => {
      handleResponseChange(val);
      if (type === "radio" || type === "rating") {
        setTimeout(() => {
          nextStep();
        }, 500); // Wait half a second for user to see selection
      }
    };
  };

  const renderField = () => {
    if (isReviewStep) {
      return (
        <ReviewScreen 
          survey={survey} 
          responses={responses} 
          onSubmit={handleSubmit} 
          onEdit={setStep}
          isSubmitting={isSubmitting}
          isOffline={isOffline}
        />
      );
    }

    if (!currentField) return null;

    const value = responses[currentField.question] || "";
    const error = errors[currentField.question];

    return (
      <QuestionCard field={currentField}>
        {currentField.type === "radio" && (
           <InputRadioGroup 
             options={currentField.options || []}
             value={value}
             onChange={handleNextWithAutoAdvance("radio")}
             error={error}
           />
        )}
        
        {currentField.type === "checkbox" && (
           <InputCheckboxGroup 
             options={currentField.options || []}
             values={Array.isArray(value) ? value : []}
             onChange={handleResponseChange}
             error={error}
           />
        )}
        
        {currentField.type === "select" && (
           <InputSelect
             options={currentField.options || []}
             value={value}
             onChange={(e) => handleResponseChange(e.target.value)}
             error={error}
           />
        )}
        
        {currentField.type === "rating" && (
           <RatingScale
             maxRating={currentField.maxRating || 10}
             value={value}
             onChange={handleNextWithAutoAdvance("rating")}
             error={error}
           />
        )}
        
        {currentField.type === "textarea" && (
           <InputTextarea
             value={value}
             onChange={(e) => handleResponseChange(e.target.value)}
             error={error}
             placeholder="Type your answer here..."
           />
        )}
        
        {(currentField.type === "text" || currentField.type === "email" || currentField.type === "number" || currentField.type === "date") && (
           <InputText
             type={currentField.type}
             value={value}
             onChange={(e) => handleResponseChange(e.target.value)}
             error={error}
             placeholder={currentField.type === "email" ? "name@example.com" : "Type your answer here..."}
           />
        )}
        
        {currentField.type === "file" && (
           <InputFile
             value={value}
             onChange={(file: File | null) => {
               if (file) handleFileUpload(file);
               else handleResponseChange(null);
             }}
             error={error}
           />
        )}
      </QuestionCard>
    );
  };

  return (
    <>
      <NetworkStatusBanner isOffline={isOffline} />
      <SurveyShell
        title={survey.title}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={nextStep}
        onPrev={prevStep}
        canGoNext={true} // In single-step interfaces, 'next' often just triggers validation
      >
        {renderField()}
      </SurveyShell>
    </>
  );
}
