"use client";
import { useState } from "react";
import TextInput from "../../components/TextInput";
import TextArea from "../../components/TextArea";
import RadioButton from "../../components/RadioButton";
import Checkbox from "../../components/Checkbox";
import FileUpload from "../../components/FileUpload";
import {
  Survey,
  SurveyField,
  RadioButtonField,
  CheckboxField,
} from "../../types/survey";

export default function SurveyPage() {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [importMessage, setImportMessage] = useState(
    "Please upload the cdn-survey JSON file to start. Please note you are just viewing the survey and not submitting it."
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
        setImportMessage("");
      } catch (error) {
        console.error("Failed to parse JSON:", error);
        alert("Invalid JSON format. Please upload a valid survey JSON file.");
      }
    }
  };

  const validateField = (field: SurveyField, value: any) => {
    let error = "";
    if (field.required && !value) {
      error = `This question is required`;
    } else if (field.type === "email" && value && !/\S+@\S+\.\S+/.test(value)) {
      error = "Please enter a valid email address";
    }
    return error;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    const newErrors: Record<string, string> = {};
    survey?.formFields.forEach((field) => {
      const error = validateField(field, responses[field.question]);
      if (error) {
        newErrors[field.question] = error;
      }
    });

    if (Object.keys(newErrors).length === 0) {
      setSuccessMessage("Survey completed successfully!");
    } else {
      setErrors(newErrors);
    }

    setIsLoading(false);
  };

  if (!survey) {
    return (
      <div className="container mx-auto p-4 mt-10 mb-5">
        <div className="bg-white p-5 mb-10 rounded-2xl">
          <h1 className="text-4xl font-bold mb-5 text-center">View Survey</h1>
          <p className="text-center mb-7">{importMessage}</p>
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
    );
  }

  return (
    <div className="container mx-auto p-4 mt-10 mb-5">
      <div className="bg-white p-5 mb-10 rounded-2xl">
        <h1 className="text-4xl capitalize font-bold mb-4 text-center">{survey.title}</h1>
        <h2 className="mb-5 text-lg text-center">{survey.description}</h2>

        <hr className="border-t-2 border-gray-300 rounded-full my-4 mb-5" />

        {isLoading && <p>Loading...</p>}
        {successMessage && <p className="text-green-500 font-semibold">{successMessage}</p>}
        {errorMessage && <p className="text-red-500 font-semibold">{errorMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {survey.formFields.map((field, index) => {
            const fieldName = field.question;

            return (
              <div key={index} className="mb-6">
                <label className="block text-lg font-medium mb-2">
                  {fieldName}
                </label>
                {field.type === "checkbox" ? (
                  <Checkbox
                    options={(field as CheckboxField).options}
                    selectedOptions={responses[fieldName] || []}
                    onChange={(updatedOptions) =>
                      setResponses({
                        ...responses,
                        [fieldName]: updatedOptions,
                      })
                    }
                  />
                ) : field.type === "radio" ? (
                  <RadioButton
                    options={(field as RadioButtonField).options}
                    selectedOption={responses[fieldName] || ""}
                    onChange={(value) =>
                      setResponses({ ...responses, [fieldName]: value })
                    }
                  />
                ) : field.type === "date" ? (
                  <input
                    type="date"
                    className="border-2 px-3 py-3 rounded-xl w-full mt-3 border-gray-600"
                    onChange={(e) =>
                      setResponses({
                        ...responses,
                        [fieldName]: e.target.value,
                      })
                    }
                  />
                ) : field.type === "number" ? (
                  <input
                    type="number"
                    className="border-2 px-3 py-3 rounded-xl w-full mt-3 border-gray-600"
                    onChange={(e) =>
                      setResponses({
                        ...responses,
                        [fieldName]: e.target.value,
                      })
                    }
                  />
                ) : field.type === "file" ? (
                  <FileUpload
                    onChange={(file) =>
                      file && setResponses({ ...responses, [fieldName]: file })
                    }
                  />
                ) : field.type === "email" ? (
                  <input
                    type="email"
                    className="border-2 px-3 py-3 rounded-xl w-full mt-3 border-gray-600"
                    onChange={(e) =>
                      setResponses({
                        ...responses,
                        [fieldName]: e.target.value,
                      })
                    }
                  />
                ) : field.type === "textarea" ? (
                  <TextArea
                    onChange={(value) =>
                      setResponses({ ...responses, [fieldName]: value })
                    }
                  />
                ) : (
                  <TextInput
                    onChange={(value) =>
                      setResponses({ ...responses, [fieldName]: value })
                    }
                  />
                )}
                {errors[fieldName] && (
                  <p className="text-red-500">{errors[fieldName]}</p>
                )}
              </div>
            );
          })}
          <button
            type="submit"
            className="w-full md:w-auto px-4 py-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
          >
            Submit Survey
          </button>
        </form>
      </div>
    </div>
  );
}
