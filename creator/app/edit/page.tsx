"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Survey, SurveyField } from "../../types/survey";
import { MdDelete } from "react-icons/md";
import { FaAlignLeft, FaCalendarAlt, FaCheckSquare, FaDotCircle, FaEnvelope, FaFileUpload, FaFont, FaHashtag, FaPlus } from "react-icons/fa";

export default function EditSurveyPage() {
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(false);
  const [importMessage, setImportMessage] = useState(
    "To edit an existing survey, import your previously generated JSON file. The file must be created using our survey creation tool and contain 'cdn-survey' in its name to ensure compatibility and prevent errors."
  );

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if the file name includes 'cdn-survey'
      if (!file.name.includes("cdn-survey")) {
        alert(
          "Invalid file. Please upload a JSON file with 'cdn-survey' in its name."
        );
        event.target.value = "";
        return;
      }

      try {
        const fileData = await file.text();
        const parsedSurvey = JSON.parse(fileData);
        setSurvey(parsedSurvey);
        setImportMessage("Survey loaded successfully! You can now edit it.");
      } catch (error) {
        console.error("Failed to parse JSON:", error);
        alert("Invalid JSON format. Please upload a valid survey JSON file.");
      }
    }
  };

  const handleUpdateSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (survey) {
      // Confirm before generating a new JSON file
      const confirmed = confirm(
        "Are you sure you want to save and download the edited survey?"
      );
      if (confirmed) {
        const updatedSurvey = { ...survey };

        // Create and download the new JSON file
        const blob = new Blob([JSON.stringify(updatedSurvey, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${updatedSurvey.title || "survey"}-cdn-survey.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        // Redirect to the admin page after delaying for 1 second
        setTimeout(() => router.push("/"), 1000);
      }
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  const addQuestion = (type: string) => {
    if (survey) {
      const newQuestion: SurveyField = {
        type: type as
          | "text"
          | "textarea"
          | "radio"
          | "checkbox"
          | "date"
          | "number"
          | "file"
          | "email",
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
        updatedFields[index].options = [
          ...(updatedFields[index].options || []),
          "",
        ];
      }
      setSurvey({ ...survey, formFields: updatedFields });
    }
  };

  const updateOption = (
    fieldIndex: number,
    optionIndex: number,
    value: string
  ) => {
    if (survey && "options" in survey.formFields[fieldIndex]) {
      const updatedFields = [...survey.formFields];
      if ("options" in updatedFields[fieldIndex]) {
        updatedFields[fieldIndex].options[optionIndex] = value;
      }
      setSurvey({ ...survey, formFields: updatedFields });
    }
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    if (
      survey &&
      (survey.formFields[fieldIndex].type === "radio" ||
        survey.formFields[fieldIndex].type === "checkbox")
    ) {
      const updatedFields = [...survey.formFields];
      if ("options" in updatedFields[fieldIndex]) {
        updatedFields[fieldIndex].options = updatedFields[
          fieldIndex
        ].options!.filter((_, i) => i !== optionIndex);
      }
      setSurvey({ ...survey, formFields: updatedFields });
    }
  };

  const moveQuestionUp = (index: number) => {
    if (index > 0 && survey) {
      const updatedFields = [...survey.formFields];
      [updatedFields[index - 1], updatedFields[index]] = [
        updatedFields[index],
        updatedFields[index - 1],
      ];
      setSurvey({ ...survey, formFields: updatedFields });
    }
  };

  const moveQuestionDown = (index: number) => {
    if (index < survey!.formFields.length - 1 && survey) {
      const updatedFields = [...survey.formFields];
      [updatedFields[index], updatedFields[index + 1]] = [
        updatedFields[index + 1],
        updatedFields[index],
      ];
      setSurvey({ ...survey, formFields: updatedFields });
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-4 mt-10 mb-5">
      {/* Import Survey JSON File */}
      {!survey && (
        <div className="bg-white p-5 mb-10 rounded-2xl">
          <div className="mb-2">
            <h1 className="text-4xl font-bold mb-5 text-center">Edit Survey</h1>
            <p className="text-center mb-7">
              <span className="font-semibold text-red-700">INSTRUCTIONS: </span>
              {importMessage}
            </p>
            <div className="flex items-center justify-center">
              <label
                htmlFor="file-upload"
                className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg shadow-md cursor-pointer hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-150"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V8.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0010.586 2H4zm5 0v4a1 1 0 001 1h4v7H5V4h4zm2 0h2.586L11 5.586V3z"
                    clipRule="evenodd"
                  />
                </svg>
                Upload Survey File
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      {survey && (
        <>
        <div className="bg-white p-5 mb-10 rounded-2xl">
        <h1 className="text-4xl font-bold mb-5 text-center">Edit Survey</h1>
        <p className="text-center">
          <span className="font-semibold text-red-700">INSTRUCTIONS:</span>{" "}
          After importing your existing survey file, carefully review and make your desired changes. Take time to check all questions, required fields, and survey details. Once you're satisfied with your edits, click 'Create' to download the updated version of your survey.
        </p>
      </div>
        <form
          onSubmit={handleUpdateSurvey}
          className="space-y-10 bg-white p-5 rounded-2xl"
        >
          <div>
            <label className="font-semibold">Survey Title</label>
            <input
              type="text"
              value={survey.title}
              onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
              className="border-2 px-3 py-3 rounded-xl w-full mt-3 border-gray-600"
              placeholder="Enter survey title"
            />
          </div>

          <div>
            <label className="font-semibold">Survey Description</label>
            <textarea
              value={survey.description || ""}
              onChange={(e) =>
                setSurvey({ ...survey, description: e.target.value })
              }
              className="border-2 px-3 py-3 rounded-xl w-full mt-3 border-gray-600"
              placeholder="Enter survey description"
              rows={4}
            />
          </div>

          <hr className="border-t-2 border-gray-300 rounded-full my-4" />

          {survey.formFields.map((field, index) => (
            <div
              key={index}
              className="space-y-3 border-2 border-gray-600 p-5 rounded-xl"
            >
              <div className="flex justify-between items-center mb-2">
                <label className="font-bold uppercase">
                  Question {index + 1}
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => moveQuestionUp(index)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveQuestionDown(index)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={index === survey.formFields.length - 1}
                    aria-label="Delete question"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteQuestion(index)}
                    className="flex-1 px-3 py-2 bg-red-500 text-white rounded"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>

              <select
                value={field.type}
                onChange={(e) =>
                  handleFieldChange(index, "type", e.target.value)
                }
                className="border-2 border-gray-600 px-2 py-2 rounded-lg w-full mb-2 bg-gray-600 text-white"
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
                className="border-2 px-3 py-3 rounded-xl w-full mt-3 border-gray-600"
                placeholder="Enter question text"
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) =>
                    handleFieldChange(index, "required", e.target.checked)
                  }
                  className="h-5 w-4"
                  id={`required-checkbox-${index}`}
                />
                <label
                  htmlFor={`required-checkbox-${index}`}
                  className="font-semibold text-gray-700"
                >
                  Required
                </label>
              </div>

              {(field.type === "radio" || field.type === "checkbox") && (
                <div>
                  <label className="font-semibold mr-2">Options:</label>
                  {field.options &&
                    field.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className="flex items-center space-x-2 mb-3 mt-1"
                      >
                        <input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            updateOption(index, optIndex, e.target.value)
                          }
                          className="border-2 px-3 py-3 rounded-xl w-full border-gray-600 h-12"
                          placeholder={`Option ${optIndex + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(index, optIndex)}
                          className="px-4 py-3 bg-red-500 text-white rounded-md h-12 flex items-center justify-center"
                        >
                           <MdDelete />
                        </button>
                      </div>
                    ))}
                  <button
                    type="button"
                    onClick={() => addOption(index)}
                    className="mt-2 flex items-center px-2 py-1 bg-green-600 text-white rounded-md font-semibold"
                  >
                    <FaPlus className="mr-1" />
                    Add Option
                  </button>
                </div>
              )}
            </div>
          ))}

          <div className="container mx-auto mt-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => addQuestion("text")}
              className="flex items-center justify-center w-full px-5 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-150"
            >
              <FaFont className="mr-2" />
              Add Text Field
            </button>
            <button
              type="button"
              onClick={() => addQuestion("textarea")}
              className="flex items-center justify-center w-full px-5 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-150"
            >
              <FaAlignLeft className="mr-2" />
              Add Textarea
            </button>
            <button
              type="button"
              onClick={() => addQuestion("radio")}
              className="flex items-center justify-center w-full px-5 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-150"
            >
              <FaDotCircle className="mr-2" />
              Add Radio Button
            </button>
            <button
              type="button"
              onClick={() => addQuestion("checkbox")}
              className="flex items-center justify-center w-full px-5 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-150"
            >
              <FaCheckSquare className="mr-2" />
              Add Checkbox
            </button>
            <button
              type="button"
              onClick={() => addQuestion("date")}
              className="flex items-center justify-center w-full px-5 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-150"
            >
              <FaCalendarAlt className="mr-2" />
              Add Date Picker
            </button>
            <button
              type="button"
              onClick={() => addQuestion("number")}
              className="flex items-center justify-center w-full px-5 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-150"
            >
              <FaHashtag className="mr-2" />
              Add Number Input
            </button>
            <button
              type="button"
              onClick={() => addQuestion("file")}
              className="flex items-center justify-center w-full px-5 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-150"
            >
              <FaFileUpload className="mr-2" />
              Add File Upload
            </button>
            <button
              type="button"
              onClick={() => addQuestion("email")}
              className="flex items-center justify-center w-full px-5 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-150"
            >
              <FaEnvelope className="mr-2" />
              Add Email Input
            </button>
          </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              type="submit"
              className="w-full md:w-auto px-4 py-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
            >
              Save Survey
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full md:w-auto px-4 py-3 bg-gray-600 text-white rounded-md font-semibold"
            >
              Go Back
            </button>
          </div>
        </form>
        </>
      )}
    </div>
  );
}
