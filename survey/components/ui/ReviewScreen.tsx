import { Survey, SurveyField } from "../../types/survey";

interface ReviewScreenProps {
  survey: Survey;
  responses: Record<string, any>;
  onSubmit: () => void;
  onEdit: (stepIndex: number) => void;
  isSubmitting: boolean;
  isOffline: boolean;
}

export default function ReviewScreen({ 
  survey, 
  responses, 
  onSubmit, 
  onEdit, 
  isSubmitting,
  isOffline
}: ReviewScreenProps) {
  
  const formatResponse = (field: SurveyField, value: any) => {
    if (value === undefined || value === null || value === "") return <em className="text-muted-foreground">No answer provided</em>;
    if (Array.isArray(value)) return value.join(", ");
    if (field.type === "file") return <span className="text-primary truncate break-all">{value.name || "File uploaded"}</span>;
    return value.toString();
  };

  return (
    <div className="animate-slide-in-right pb-10 w-full mt-4">
      <div className="bg-card rounded-2xl shadow-sm border p-6 md:p-8">
        <h2 className="font-heading text-2xl font-bold mb-6 text-foreground">Review Your Answers</h2>
        
        <div className="space-y-6 mb-8">
          {survey.formFields.map((field, index) => (
            <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-foreground text-lg pr-4">{field.question}</span>
                <button 
                  onClick={() => onEdit(index)}
                  className="text-primary hover:underline text-sm font-medium shrink-0"
                >
                  Edit
                </button>
              </div>
              <div className="text-muted-foreground">
                {formatResponse(field, responses[field.question])}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onSubmit}
          disabled={isSubmitting || isOffline}
          className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${
            isOffline 
              ? "bg-secondary text-muted-foreground cursor-not-allowed" 
              : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md"
          }`}
        >
          {isSubmitting ? "Submitting..." : isOffline ? "Offline - Waiting for Connection" : "Submit Survey"}
        </button>
      </div>
    </div>
  );
}
