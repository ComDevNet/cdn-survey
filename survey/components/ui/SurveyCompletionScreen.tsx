import { FiCheckCircle } from "react-icons/fi";

export default function SurveyCompletionScreen({ 
  onReturnHome 
}: { 
  onReturnHome: () => void 
}) {
  return (
    <div className="w-full max-w-lg mx-auto bg-card rounded-2xl shadow-sm border p-10 text-center animate-slide-in-right">
      <div className="flex justify-center mb-6 text-success animate-pop-in">
        <FiCheckCircle size={80} />
      </div>
      <h2 className="font-heading text-3xl font-bold mb-4 text-foreground">Survey Complete!</h2>
      <p className="text-muted-foreground mb-8 text-lg">
        Thank you for your time. Your responses have been successfully recorded.
      </p>
      
      <button 
        onClick={onReturnHome}
        className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors w-full sm:w-auto"
      >
        Return to Dashboard
      </button>
    </div>
  );
}
