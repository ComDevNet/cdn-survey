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

  const handleExportSurvey = (e: React.FormEvent) => {
    e.preventDefault();

    // Survey data to export as JSON
    const surveyData = { title, description, formFields };
    const blob = new Blob([JSON.stringify(surveyData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    // Create a link element and click it to trigger the download
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title || "survey"}-cdn-survey.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // redirect back after exporting but wait for the download to start
    setTimeout(() => router.push("/"), 1000);
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className="container mx-auto p-4 mt-10 mb-5">
      <div className="bg-white p-5 mb-10 rounded-2xl">
        <h1 className="text-4xl font-bold mb-5 text-center">Create Survey</h1>
        <p className="text-center">
          <span className="font-semibold text-red-700">INSTRUCTIONS:</span>{" "}
          Start by adding a clear title and description for your survey. Then
          create your questions and review them carefully, marking essential
          questions as required. Once finished, click 'Create' to download the
          survey as a JSON file. Finally, import this file into the CDN Survey
          app on the CDN server.
        </p>
      </div>

      <form
        onSubmit={handleExportSurvey}
        className="space-y-10 bg-white p-5 rounded-2xl"
      >
        <div>
          <label className="font-semibold">
            Survey Title <span className="text-red-700 font-black">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-2 px-3 py-3 rounded-xl w-full mt-3 border-gray-600"
            placeholder="Enter Survey Title"
            required
          />
        </div>

        <div>
          <label className="font-semibold">
            Survey Description{" "}
            <span className="text-red-700 font-black">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border-2 px-3 py-3 rounded-xl w-full mt-3 border-gray-600"
            placeholder="Enter Survey Description"
            rows={6}
            required
          />
        </div>

        <hr className="border-t-2 border-gray-300 rounded-full my-4" />

        {formFields.map((field, index) => (
          <div
            key={index}
            className="space-y-3 border-2 border-gray-600 p-5 rounded-xl"
          >
            <div className="flex items-center justify-between mb-2">
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
                  disabled={index === formFields.length - 1}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => deleteQuestion(index)}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded"
                  aria-label="Delete question"
                >
                  <MdDelete />
                </button>
              </div>
            </div>

            <select
              value={field.type}
              onChange={(e) => handleFieldChange(index, "type", e.target.value)}
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
              placeholder="Enter Question"
            />

            <div className="flex items-center space-x-2 ml-1">
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
              onClick={() => addField("text")}
              className="flex items-center justify-center w-full px-5 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-150"
            >
              <FaFont className="mr-2" />
              Add Text Field
            </button>
            <button
              type="button"
              onClick={() => addField("textarea")}
              className="flex items-center justify-center w-full px-5 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-150"
            >
              <FaAlignLeft className="mr-2" />
              Add Textarea
            </button>
            <button
              type="button"
              onClick={() => addField("radio")}
              className="flex items-center justify-center w-full px-5 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-150"
            >
              <FaDotCircle className="mr-2" />
              Add Radio Button
            </button>
            <button
              type="button"
              onClick={() => addField("checkbox")}
              className="flex items-center justify-center w-full px-5 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-150"
            >
              <FaCheckSquare className="mr-2" />
              Add Checkbox
            </button>
            <button
              type="button"
              onClick={() => addField("date")}
              className="flex items-center justify-center w-full px-5 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-150"
            >
              <FaCalendarAlt className="mr-2" />
              Add Date Picker
            </button>
            <button
              type="button"
              onClick={() => addField("number")}
              className="flex items-center justify-center w-full px-5 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-150"
            >
              <FaHashtag className="mr-2" />
              Add Number Input
            </button>
            <button
              type="button"
              onClick={() => addField("file")}
              className="flex items-center justify-center w-full px-5 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-150"
            >
              <FaFileUpload className="mr-2" />
              Add File Upload
            </button>
            <button
              type="button"
              onClick={() => addField("email")}
              className="flex items-center justify-center w-full px-5 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-150"
            >
              <FaEnvelope className="mr-2" />
              Add Email Input
            </button>
          </div>
        </div>

        <div className="flex flex-col space-y-4 mt-6 md:flex-row md:space-x-4 md:space-y-0">
          <button
            type="submit"
            className="w-full md:w-auto px-4 py-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
          >
            Create Survey
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
    </div>
  );
}
