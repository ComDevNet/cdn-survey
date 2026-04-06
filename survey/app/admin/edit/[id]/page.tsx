"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Survey, SurveyField } from "../../../../types/survey";

import { MdDelete } from "react-icons/md";
import {
  FaAlignLeft,
  FaCalendarAlt,
  FaCheckSquare,
  FaDotCircle,
  FaEnvelope,
  FaFileUpload,
  FaFont,
  FaHashtag,
  FaPlus,
} from "react-icons/fa";

export default function EditSurveyPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/surveys/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setSurvey({ ...data });
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching survey:", error);
          setLoading(false);
        });
    }
  }, [id]);

  const generateNewId = () => {
    const timestamp = Date.now().toString();
    return `survey_${timestamp}`;
  };

  const handleUpdateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (survey) {
      const confirmed = confirm("Are you sure you want to save these changes?");
      if (confirmed) {
        const newId = generateNewId();
        const updatedSurvey = { ...survey, id: newId };
        await fetch(`/api/surveys`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedSurvey),
        });
        await fetch(`/api/surveys/${id}`, { method: "DELETE" });
        router.push("/admin");
      }
    }
  };

  const handleCancel = () => router.push("/admin");

  const addQuestion = (type: string) => {
    if (survey) {
      const newQuestion: SurveyField = {
        type: type as "text" | "textarea" | "radio" | "checkbox" | "date" | "number" | "file" | "email",
        question: "",
        required: false,
        options: type === "radio" || type === "checkbox" ? [""] : [],
      };
      setSurvey({ ...survey, formFields: [...survey.formFields, newQuestion] });
    }
  };

  const deleteQuestion = (index: number) => {
    if (survey) {
      setSurvey({ ...survey, formFields: survey.formFields.filter((_, i) => i !== index) });
    }
  };

  const handleFieldChange = (index: number, key: string, value: any) => {
    if (survey) {
      setSurvey({
        ...survey,
        formFields: survey.formFields.map((field, i) =>
          i === index ? { ...field, [key]: value } : field
        ),
      });
    }
  };

  const addOption = (index: number) => {
    if (survey && "options" in survey.formFields[index]) {
      const updatedFields = [...survey.formFields];
      if ("options" in updatedFields[index]) {
        updatedFields[index].options = [...(updatedFields[index].options || []), ""];
      }
      setSurvey({ ...survey, formFields: updatedFields });
    }
  };

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    if (survey && "options" in survey.formFields[fieldIndex]) {
      const updatedFields = [...survey.formFields];
      if ("options" in updatedFields[fieldIndex]) {
        updatedFields[fieldIndex].options[optionIndex] = value;
      }
      setSurvey({ ...survey, formFields: updatedFields });
    }
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    if (survey && (survey.formFields[fieldIndex].type === "radio" || survey.formFields[fieldIndex].type === "checkbox")) {
      const updatedFields = [...survey.formFields];
      if ("options" in updatedFields[fieldIndex]) {
        updatedFields[fieldIndex].options = updatedFields[fieldIndex].options!.filter((_, i) => i !== optionIndex);
      }
      setSurvey({ ...survey, formFields: updatedFields });
    }
  };

  const moveQuestionUp = (index: number) => {
    if (index > 0 && survey) {
      const updatedFields = [...survey.formFields];
      [updatedFields[index - 1], updatedFields[index]] = [updatedFields[index], updatedFields[index - 1]];
      setSurvey({ ...survey, formFields: updatedFields });
    }
  };

  const moveQuestionDown = (index: number) => {
    if (index < survey!.formFields.length - 1 && survey) {
      const updatedFields = [...survey.formFields];
      [updatedFields[index], updatedFields[index + 1]] = [updatedFields[index + 1], updatedFields[index]];
      setSurvey({ ...survey, formFields: updatedFields });
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-2xl text-muted-foreground font-semibold animate-pulse">Loading survey…</p>
      </div>
    );
  if (!survey)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive text-xl font-semibold">Error: Survey not found.</p>
      </div>
    );

  const fieldButtonClass =
    "flex items-center justify-center w-full px-5 py-4 bg-secondary text-secondary-foreground border border-border shadow-sm rounded-xl font-semibold hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary transition-all hover:-translate-y-1";

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="container mx-auto p-4 pt-10 mb-5">
        <div className="bg-card text-card-foreground border border-border p-6 md:p-10 mb-10 rounded-3xl shadow-sm">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-8 text-center text-foreground">Edit Survey</h1>

          <form onSubmit={handleUpdateSurvey} className="space-y-6">
            {/* Title */}
            <div>
              <label className="font-semibold text-lg text-foreground">Survey Title</label>
              <input
                type="text"
                value={survey.title}
                onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all mt-3 text-foreground placeholder:text-muted-foreground"
                placeholder="Enter survey title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="font-semibold text-lg text-foreground">Survey Description</label>
              <textarea
                value={survey.description || ""}
                onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all mt-3 text-foreground placeholder:text-muted-foreground resize-y"
                placeholder="Enter survey description"
                rows={5}
              />
            </div>

            <hr className="border-t border-border rounded-full my-8" />

            {/* Question Cards */}
            {survey.formFields.map((field, index) => (
              <div key={index} className="space-y-4 border border-border bg-background p-6 rounded-2xl shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                  <label className="font-bold text-lg text-primary uppercase tracking-wide">
                    Question {index + 1}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => moveQuestionUp(index)} disabled={index === 0}
                      className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80 disabled:opacity-40 transition-all border border-border shadow-sm">
                      ↑
                    </button>
                    <button type="button" onClick={() => moveQuestionDown(index)} disabled={index === survey.formFields.length - 1}
                      className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80 disabled:opacity-40 transition-all border border-border shadow-sm">
                      ↓
                    </button>
                    <button type="button" onClick={() => deleteQuestion(index)}
                      className="px-4 py-2 bg-destructive text-destructive-foreground font-bold rounded-lg hover:bg-destructive/90 transition-all shadow-sm flex items-center justify-center">
                      <MdDelete className="text-lg" />
                    </button>
                  </div>
                </div>

                <select value={field.type} onChange={(e) => handleFieldChange(index, "type", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all mb-2 font-semibold">
                  <option value="text">Text Input</option>
                  <option value="textarea">Textarea</option>
                  <option value="radio">Radio Button</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="date">Date Picker</option>
                  <option value="number">Number Input</option>
                  <option value="file">File Upload</option>
                  <option value="email">Email Input</option>
                </select>

                <input type="text" value={field.question} onChange={(e) => handleFieldChange(index, "question", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all mt-3 text-foreground placeholder:text-muted-foreground font-medium text-lg"
                  placeholder="Enter Question Prompt"
                />

                <div className="flex items-center space-x-3 ml-2 py-2">
                  <input type="checkbox" checked={field.required} onChange={(e) => handleFieldChange(index, "required", e.target.checked)}
                    className="w-5 h-5 rounded border-border text-primary cursor-pointer accent-primary"
                    id={`required-checkbox-${index}`}
                  />
                  <label htmlFor={`required-checkbox-${index}`} className="font-semibold text-foreground cursor-pointer select-none">
                    Required Response
                  </label>
                </div>

                {(field.type === "radio" || field.type === "checkbox") && (
                  <div className="mt-4 bg-card border border-border/50 p-4 rounded-xl">
                    <label className="font-semibold text-muted-foreground block mb-3">Available Options:</label>
                    {field.options && field.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-3 mb-3">
                        <div className="w-2 h-2 rounded-full bg-border flex-shrink-0" />
                        <input type="text" value={option} onChange={(e) => updateOption(index, optIndex, e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground/50"
                          placeholder={`Option ${optIndex + 1}`}
                        />
                        <button type="button" onClick={() => removeOption(index, optIndex)}
                          className="p-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg flex items-center justify-center transition-colors">
                          <MdDelete className="text-xl" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addOption(index)}
                      className="mt-3 flex items-center px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-lg font-semibold hover:bg-secondary/80 transition-all text-sm">
                      <FaPlus className="mr-2 opacity-70" /> Add Another Option
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Add Question Buttons */}
            <div className="mt-10">
              <h3 className="font-heading font-bold text-xl mb-4 text-foreground">Add New Question</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                <button type="button" onClick={() => addQuestion("text")} className={fieldButtonClass}><FaFont className="mr-3 opacity-60 text-lg" />Text Input</button>
                <button type="button" onClick={() => addQuestion("textarea")} className={fieldButtonClass}><FaAlignLeft className="mr-3 opacity-60 text-lg" />Textarea</button>
                <button type="button" onClick={() => addQuestion("radio")} className={fieldButtonClass}><FaDotCircle className="mr-3 opacity-60 text-lg" />Choice (Radio)</button>
                <button type="button" onClick={() => addQuestion("checkbox")} className={fieldButtonClass}><FaCheckSquare className="mr-3 opacity-60 text-lg" />Multi-Select</button>
                <button type="button" onClick={() => addQuestion("date")} className={fieldButtonClass}><FaCalendarAlt className="mr-3 opacity-60 text-lg" />Date Picker</button>
                <button type="button" onClick={() => addQuestion("number")} className={fieldButtonClass}><FaHashtag className="mr-3 opacity-60 text-lg" />Numeric</button>
                <button type="button" onClick={() => addQuestion("file")} className={fieldButtonClass}><FaFileUpload className="mr-3 opacity-60 text-lg" />File Upload</button>
                <button type="button" onClick={() => addQuestion("email")} className={fieldButtonClass}><FaEnvelope className="mr-3 opacity-60 text-lg" />Email Input</button>
              </div>
            </div>

            {/* Submit / Cancel */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-12 justify-center">
              <button type="submit"
                className="w-full sm:w-auto px-10 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-md transform hover:-translate-y-1">
                Save Changes
              </button>
              <button type="button" onClick={handleCancel}
                className="w-full sm:w-auto px-10 py-4 bg-transparent border-2 border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground rounded-xl font-bold transition-all">
                Discard Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
