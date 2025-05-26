"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import TextInput from "../../../components/TextInput";
import TextArea from "../../../components/TextArea";
import RadioButton from "../../../components/RadioButton";
import Checkbox from "../../../components/Checkbox";
import FileUpload from "../../../components/FileUpload";
import {
  Survey,
  SurveyField,
  RadioButtonField,
  CheckboxField,
} from "../../../types/survey";

export default function SurveyPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (id) {
      fetch(`/api/surveys/${id}`)
        .then((res) => res.json())
        .then((data) => setSurvey(data))
        .catch(() => setErrorMessage("Failed to load survey."));
    }
  }, [id]);

  const validateField = (field: SurveyField, value: any) => {
    let error = "";
    if (field.required && !value) {
      error = `Question is required`;
    } else if (field.type === "email" && value && !/\S+@\S+\.\S+/.test(value)) {
      error = "Please enter a valid email address";
    }
    return error;
  };

  const handleFileUpload = async (file: File, fieldName: string) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResponses((prevResponses) => ({
          ...prevResponses,
          [fieldName]: data.url,
        }));
      } else {
        console.error("File upload failed");
        setErrorMessage("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setErrorMessage("An error occurred during file upload");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      try {
        const formData = new FormData();

        if (!survey) return;
        for (const field of survey.formFields) {
          const responseValue = responses[field.question];

          if (field.type === "checkbox") {
            formData.append(
              field.question,
              Array.isArray(responseValue) && responseValue.length > 0
                ? responseValue.join(", ")
                : ""
            );
          } else if (field.type === "radio") {
            formData.append(field.question, responseValue || "");
          } else if (field.type === "file") {
            // Append the file URL (already uploaded) if present
            formData.append(field.question, responseValue || ""); // Append URL or empty string
          } else if (field.type === "textarea") {
            const formattedResponse = String(responseValue || "").replace(
              /\n/g,
              ", "
            );
            formData.append(field.question, formattedResponse);
          } else {
            formData.append(field.question, String(responseValue || ""));
          }
        }

        const response = await fetch(`/api/surveys/${id}/results`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          setSuccessMessage("Survey submitted successfully!");
          setTimeout(() => router.push("/"), 1000);
        } else {
          setErrorMessage("Failed to submit survey. Please try again.");
        }
      } catch (err) {
        console.error("Error submitting survey:", err);
        setErrorMessage("An error occurred while submitting the survey.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
      setIsLoading(false);
    }
  };

  if (!survey) return <p>Loading survey...</p>;

  return (
    <div className="container mx-auto p-4 mt-10 mb-5">
      <div className="bg-white p-5 mb-10 rounded-2xl">
        <h1 className="text-4xl capitalize font-bold mb-4 mt-4 text-center">{survey.title}</h1>
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
                    name={fieldName}
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
