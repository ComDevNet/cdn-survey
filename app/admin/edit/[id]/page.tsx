"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Survey, SurveyField } from "../../../../types/survey";

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
      // Prompt the user with a confirmation message
      const confirmed = confirm("Are you sure you want to edit this survey?");
      if (confirmed) {
        // Generate new ID and prepare updated survey
        const newId = generateNewId();
        const updatedSurvey = { ...survey, id: newId };
  
        // Save the new survey entry
        await fetch(`/api/surveys`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedSurvey),
        });
  
        // Delete the original survey
        await fetch(`/api/surveys/${id}`, { method: "DELETE" });
  
        // Navigate back to admin page
        router.push("/admin");
      }
      // If the user cancels, do nothing and remain on the edit page
    }
  };
  
  

  const handleCancel = () => {
    router.push("/admin");
  };

  const addQuestion = (type: string) => {
    if (survey) {
      const newQuestion: SurveyField = {
        type: type as "text" | "textarea" | "radio" | "checkbox" | "date" | "number" | "file" | "email",
        question: "",
        required: false,
        options: type === "radio" || type === "checkbox" ? [""] : [],
      };
      setSurvey({
        ...survey,
        formFields: [...survey.formFields, newQuestion],
      });
    }
  };

  const deleteQuestion = (index: number) => {
    if (survey) {
      const updatedFields = survey.formFields.filter((_, i) => i !== index);
      setSurvey({
        ...survey,
        formFields: updatedFields,
      });
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

  if (loading) return <p>Loading...</p>;
  if (!survey) return <p>Error: Survey not found.</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Survey</h1>

      <form onSubmit={handleUpdateSurvey} className="space-y-4">
        <div>
          <label>Survey Title</label>
          <input
            type="text"
            value={survey.title}
            onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
            className="border px-2 py-1 rounded w-full"
            placeholder="Enter survey title"
          />
        </div>

        <div>
          <label>Survey Description</label>
          <textarea
            value={survey.description || ""}
            onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
            className="border px-2 py-1 rounded w-full"
            placeholder="Enter survey description"
            rows={4}
          />
        </div>

        {survey.formFields.map((field, index) => (
          <div key={index} className="space-y-2 border border-gray-300 p-4 rounded">
            <div className="flex justify-between items-center">
              <label>Question {index + 1}</label>
              <div className="flex space-x-2">
                <button type="button" onClick={() => moveQuestionUp(index)} className="bg-gray-300 px-2 py-1 rounded" disabled={index === 0}>↑</button>
                <button type="button" onClick={() => moveQuestionDown(index)} className="bg-gray-300 px-2 py-1 rounded" disabled={index === survey.formFields.length - 1}>↓</button>
                <button type="button" onClick={() => deleteQuestion(index)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
              </div>
            </div>

            <select value={field.type} onChange={(e) => handleFieldChange(index, "type", e.target.value)} className="border px-2 py-1 rounded w-full mb-2">
              <option value="text">Text Input</option>
              <option value="textarea">Textarea</option>
              <option value="radio">Radio Button</option>
              <option value="checkbox">Checkbox</option>
              <option value="date">Date Picker</option>
              <option value="number">Number Input</option>
              <option value="file">File Upload</option>
              <option value="email">Email Input</option>
            </select>

            <input type="text" value={field.question} onChange={(e) => handleFieldChange(index, "question", e.target.value)} className="border px-2 py-1 rounded w-full" placeholder="Enter question text" />

            <div className="flex items-center space-x-2">
              <input type="checkbox" checked={field.required} onChange={(e) => handleFieldChange(index, "required", e.target.checked)} />
              <label>Required</label>
            </div>

            {(field.type === "radio" || field.type === "checkbox") && (
              <div>
                <label>Options:</label>
                {field.options &&
                  field.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2 mb-1">
                      <input type="text" value={option} onChange={(e) => updateOption(index, optIndex, e.target.value)} className="border px-2 py-1 rounded w-full" placeholder={`Option ${optIndex + 1}`} />
                      <button type="button" onClick={() => removeOption(index, optIndex)} className="bg-red-600 text-white px-2 py-1 rounded">Remove</button>
                    </div>
                  ))}
                <button type="button" onClick={() => addOption(index)} className="bg-blue-600 text-white px-2 py-1 rounded">Add Option</button>
              </div>
            )}
          </div>
        ))}

        {/* Add Question Options */}
        <div className="space-y-2 mt-4">
          <button type="button" onClick={() => addQuestion("text")} className="px-4 py-2 bg-blue-600 text-white rounded">Add Text Field</button>
          <button type="button" onClick={() => addQuestion("textarea")} className="px-4 py-2 bg-blue-600 text-white rounded">Add Textarea</button>
          <button type="button" onClick={() => addQuestion("radio")} className="px-4 py-2 bg-blue-600 text-white rounded">Add Radio Button</button>
          <button type="button" onClick={() => addQuestion("checkbox")} className="px-4 py-2 bg-blue-600 text-white rounded">Add Checkbox</button>
          <button type="button" onClick={() => addQuestion("date")} className="px-4 py-2 bg-blue-600 text-white rounded">Add Date Picker</button>
          <button type="button" onClick={() => addQuestion("number")} className="px-4 py-2 bg-blue-600 text-white rounded">Add Number Input</button>
          <button type="button" onClick={() => addQuestion("file")} className="px-4 py-2 bg-blue-600 text-white rounded">Add File Upload</button>
          <button type="button" onClick={() => addQuestion("email")} className="px-4 py-2 bg-blue-600 text-white rounded">Add Email Input</button>
        </div>

        {/* Submit and Cancel Buttons */}
        <div className="flex space-x-4 mt-6">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save as Edited Survey</button>
          <button type="button" onClick={handleCancel} className="bg-gray-600 text-white px-4 py-2 rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
}
