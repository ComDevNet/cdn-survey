"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { MdDelete } from "react-icons/md";

import { FaPlus } from "react-icons/fa";
import {
  FaFont,
  FaAlignLeft,
  FaDotCircle,
  FaCheckSquare,
  FaCalendarAlt,
  FaHashtag,
  FaFileUpload,
  FaEnvelope,
} from "react-icons/fa";

export default function CreateSurvey() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  interface FormField {
    type: string;
    question: string;
    required: boolean;
    options?: string[];
  }

  const [formFields, setFormFields] = useState<FormField[]>([
    { type: "text", question: "", required: false, options: [] },
  ]);
  const router = useRouter();

  const addField = (type: string) => {
    const newField = {
      type,
      question: "",
      required: false,
      options: type === "radio" || type === "checkbox" ? [""] : undefined,
    };
    setFormFields([...formFields, newField]);
  };

  const handleFieldChange = (index: number, key: string, value: any) => {
    setFormFields(
      formFields.map((field, i) =>
        i === index ? { ...field, [key]: value } : field
      )
    );
  };

  const addOption = (index: number) => {
    const updatedFields = [...formFields];
    if (updatedFields[index].options) {
      updatedFields[index].options = [...updatedFields[index].options, ""];
      setFormFields(updatedFields);
    }
  };

  const updateOption = (
    fieldIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedFields = [...formFields];
    if (updatedFields[fieldIndex].options) {
      updatedFields[fieldIndex].options[optionIndex] = value;
      setFormFields(updatedFields);
    }
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const updatedFields = [...formFields];
    if (updatedFields[fieldIndex].options) {
      updatedFields[fieldIndex].options = updatedFields[
        fieldIndex
      ].options.filter((_, i) => i !== optionIndex);
      setFormFields(updatedFields);
    }
  };

  const deleteQuestion = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const moveQuestionUp = (index: number) => {
    if (index > 0) {
      const newFormFields = [...formFields];
      [newFormFields[index - 1], newFormFields[index]] = [
        newFormFields[index],
        newFormFields[index - 1],
      ];
      setFormFields(newFormFields);
    }
  };

  const moveQuestionDown = (index: number) => {
    if (index < formFields.length - 1) {
      const newFormFields = [...formFields];
      [newFormFields[index], newFormFields[index + 1]] = [
        newFormFields[index + 1],
        newFormFields[index],
      ];
      setFormFields(newFormFields);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/surveys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, formFields }),
    });
    router.push("/admin");
  };

  const handleCancel = () => {
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="container mx-auto p-4 pt-10 mb-5">
        <div className="bg-card text-card-foreground border border-border p-6 md:p-10 mb-10 rounded-3xl shadow-sm">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-8 text-center text-foreground">Create Survey</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="font-semibold text-lg text-foreground">
                Survey Title <span className="text-destructive font-black">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all mt-3 text-foreground placeholder:text-muted-foreground"
                placeholder="Enter survey title"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-lg text-foreground">
                Survey Description{" "}
                <span className="text-destructive font-black">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all mt-3 text-foreground placeholder:text-muted-foreground resize-y"
                placeholder="Enter survey description"
                rows={6}
                required
              />
            </div>

            <hr className="border-t border-border rounded-full my-8" />

            {formFields.map((field, index) => (
              <div
                key={index}
                className="space-y-4 border border-border bg-background p-6 rounded-2xl shadow-sm relative group"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                  <label className="font-bold text-lg text-primary uppercase tracking-wide">
                    Question {index + 1}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => moveQuestionUp(index)}
                      className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80 disabled:opacity-50 transition-all border border-border shadow-sm"
                      disabled={index === 0}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveQuestionDown(index)}
                      className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80 disabled:opacity-50 transition-all border border-border shadow-sm"
                      disabled={index === formFields.length - 1}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteQuestion(index)}
                      className="px-4 py-2 bg-destructive text-destructive-foreground font-bold rounded-lg hover:bg-destructive/90 transition-all shadow-sm flex items-center justify-center"
                    >
                      <MdDelete className="text-lg" />
                    </button>
                  </div>
                </div>

                <select
                  value={field.type}
                  onChange={(e) =>
                    handleFieldChange(index, "type", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all mb-2 font-semibold"
                >
                  <option value="text">Text Input</option>
                  <option value="textarea">Textarea</option>
                  <option value="radio">Radio Button</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="date">Date Picker</option>
                  <option value="number">Number Input</option>
                  <option value="file">File Upload</option>
                  <option value="email">Email Input</option>
                </select>

                <input
                  type="text"
                  value={field.question}
                  onChange={(e) =>
                    handleFieldChange(index, "question", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all mt-3 text-foreground placeholder:text-muted-foreground font-medium text-lg"
                  placeholder="Enter Question Prompt"
                />

                <div className="flex items-center space-x-3 ml-2 py-2">
                  <div className="flex items-center justify-center relative">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) =>
                        handleFieldChange(index, "required", e.target.checked)
                      }
                      className="w-5 h-5 rounded border-border text-primary cursor-pointer accent-primary"
                      id={`required-checkbox-${index}`}
                    />
                  </div>
                  <label
                    htmlFor={`required-checkbox-${index}`}
                    className="font-semibold text-foreground cursor-pointer select-none"
                  >
                    Required Response
                  </label>
                </div>

                {(field.type === "radio" || field.type === "checkbox") && (
                  <div className="mt-4 bg-card border border-border/50 p-4 rounded-xl">
                    <label className="font-semibold text-muted-foreground block mb-3">Available Options:</label>
                    {field.options &&
                      field.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className="flex items-center space-x-3 mb-3 relative group/opt"
                        >
                          <div className="w-2 h-2 rounded-full bg-border group-focus-within/opt:bg-primary transition-colors mt-1 flex-shrink-0" />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              updateOption(index, optIndex, e.target.value)
                            }
                            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground/50"
                            placeholder={`Option ${optIndex + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(index, optIndex)}
                            className="p-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg flex items-center justify-center transition-colors"
                          >
                            <MdDelete className="text-xl" />
                          </button>
                        </div>
                      ))}
                    <button
                      type="button"
                      onClick={() => addOption(index)}
                      className="mt-3 flex items-center px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-lg font-semibold hover:bg-secondary/80 transition-all text-sm"
                    >
                      <FaPlus className="mr-2 opacity-70" />
                      Add Another Option
                    </button>
                  </div>
                )}
              </div>
            ))}

            <div className="container mx-auto mt-10">
              <h3 className="font-heading font-bold text-xl mb-4 text-center md:text-left text-foreground">Add New Question</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
                <button
                  type="button"
                  onClick={() => addField("text")}
                  className="flex items-center justify-center w-full px-5 py-4 bg-secondary text-secondary-foreground border border-border shadow-sm rounded-xl font-semibold hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary transition-all hover:-translate-y-1"
                >
                  <FaFont className="mr-3 opacity-60 text-lg" />
                  Text Input
                </button>
                <button
                  type="button"
                  onClick={() => addField("textarea")}
                  className="flex items-center justify-center w-full px-5 py-4 bg-secondary text-secondary-foreground border border-border shadow-sm rounded-xl font-semibold hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary transition-all hover:-translate-y-1"
                >
                  <FaAlignLeft className="mr-3 opacity-60 text-lg" />
                  Textarea
                </button>
                <button
                  type="button"
                  onClick={() => addField("radio")}
                  className="flex items-center justify-center w-full px-5 py-4 bg-secondary text-secondary-foreground border border-border shadow-sm rounded-xl font-semibold hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary transition-all hover:-translate-y-1"
                >
                  <FaDotCircle className="mr-3 opacity-60 text-lg" />
                  Choice (Radio)
                </button>
                <button
                  type="button"
                  onClick={() => addField("checkbox")}
                  className="flex items-center justify-center w-full px-5 py-4 bg-secondary text-secondary-foreground border border-border shadow-sm rounded-xl font-semibold hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary transition-all hover:-translate-y-1"
                >
                  <FaCheckSquare className="mr-3 opacity-60 text-lg" />
                  Multi-Select
                </button>
                <button
                  type="button"
                  onClick={() => addField("date")}
                  className="flex items-center justify-center w-full px-5 py-4 bg-secondary text-secondary-foreground border border-border shadow-sm rounded-xl font-semibold hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary transition-all hover:-translate-y-1"
                >
                  <FaCalendarAlt className="mr-3 opacity-60 text-lg" />
                  Date Picker
                </button>
                <button
                  type="button"
                  onClick={() => addField("number")}
                  className="flex items-center justify-center w-full px-5 py-4 bg-secondary text-secondary-foreground border border-border shadow-sm rounded-xl font-semibold hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary transition-all hover:-translate-y-1"
                >
                  <FaHashtag className="mr-3 opacity-60 text-lg" />
                  Numeric
                </button>
                <button
                  type="button"
                  onClick={() => addField("file")}
                  className="flex items-center justify-center w-full px-5 py-4 bg-secondary text-secondary-foreground border border-border shadow-sm rounded-xl font-semibold hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary transition-all hover:-translate-y-1"
                >
                  <FaFileUpload className="mr-3 opacity-60 text-lg" />
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => addField("email")}
                  className="flex items-center justify-center w-full px-5 py-4 bg-secondary text-secondary-foreground border border-border shadow-sm rounded-xl font-semibold hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary transition-all hover:-translate-y-1"
                >
                  <FaEnvelope className="mr-3 opacity-60 text-lg" />
                  Email Input
                </button>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-12 justify-center">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-10 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-md transform hover:-translate-y-1"
                >
                  Save Full Survey
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-10 py-4 bg-transparent border-2 border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground rounded-xl font-bold transition-all"
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
