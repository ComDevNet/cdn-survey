'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import TextInput from '../../../components/TextInput';
import TextArea from '../../../components/TextArea';
import RadioButton from '../../../components/RadioButton';
import Checkbox from '../../../components/Checkbox';
import FileUpload from '../../../components/FileUpload';
import { Survey, SurveyField, RadioButtonField, CheckboxField } from '../../../types/survey';

export default function SurveyPage() {
  const params = useParams();
  const router = useRouter(); // Add useRouter hook
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (id) {
      fetch(`/api/surveys/${id}`)
        .then((res) => res.json())
        .then((data) => setSurvey(data))
        .catch(() => setErrorMessage('Failed to load survey.'));
    }
  }, [id]);

  const validateField = (field: SurveyField, value: any) => {
    let error = '';
    if (field.required && !value) {
      error = `${field.question} is required`;
    } else if (field.type === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
      error = 'Please enter a valid email address';
    }
    return error;
  };

  const handleCheckboxChange = (question: string, option: string) => {
    setResponses((prevResponses) => {
      const selectedOptions = prevResponses[question] || [];
      const updatedOptions = selectedOptions.includes(option)
        ? selectedOptions.filter((item: string) => item !== option)
        : [...selectedOptions, option];
      return { ...prevResponses, [question]: updatedOptions };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
  
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
  
        // Process responses to handle unselected checkboxes and radio buttons
        survey?.formFields.forEach((field) => {
          const responseValue = responses[field.question];
  
          if (field.type === 'checkbox') {
            formData.append(field.question, Array.isArray(responseValue) && responseValue.length > 0 ? responseValue.join(', ') : "");
          } else if (field.type === 'radio') {
            formData.append(field.question, responseValue || "");
          } else if (responseValue instanceof File) {
            formData.append(field.question, responseValue);
          } else if (field.type === 'textarea') {
            // Replace newline characters with commas for textarea fields
            const formattedResponse = String(responseValue || "").replace(/\n/g, ", ");
            formData.append(field.question, formattedResponse);
          } else {
            formData.append(field.question, String(responseValue || ""));
          }
        });
  
        console.log("FormData submission: ", formData);
  
        const response = await fetch(`/api/surveys/${id}/results`, {
          method: 'POST',
          body: formData,
        });
  
        if (response.ok) {
          setSuccessMessage('Survey submitted successfully!');
          setTimeout(() => router.push('/'), 2000); // Redirect to home page after 2 seconds
        } else {
          setErrorMessage('Failed to submit survey. Please try again.');
        }
      } catch (err) {
        setErrorMessage('An error occurred while submitting the survey.');
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{survey.title}</h1>
      {isLoading && <p>Loading...</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {survey.formFields.map((field, index) => {
          if (field.type === 'checkbox') {
            const checkboxField = field as CheckboxField;
            return (
              <div key={index} className="mb-4">
                <Checkbox
                  question={checkboxField.question}
                  options={checkboxField.options}
                  selectedOptions={responses[checkboxField.question] || []}
                  onChange={(updatedOptions) => setResponses({ ...responses, [checkboxField.question]: updatedOptions })}
                />
                {errors[checkboxField.question] && (
                  <p className="text-red-500">{errors[checkboxField.question]}</p>
                )}
              </div>
            );
          } else if (field.type === 'radio') {
            const radioField = field as RadioButtonField;
            return (
              <div key={index} className="mb-4">
                <RadioButton
                  question={radioField.question}
                  options={radioField.options}
                  onChange={(value) => setResponses({ ...responses, [radioField.question]: value })}
                />
                {errors[radioField.question] && (
                  <p className="text-red-500">{errors[radioField.question]}</p>
                )}
              </div>
            );
          } else {
            const FieldComponent =
              field.type === 'text'
                ? TextInput
                : field.type === 'textarea'
                ? TextArea
                : field.type === 'file'
                ? FileUpload
                : null;

            return (
              FieldComponent && (
                <div key={index} className="mb-4">
                  <FieldComponent
                    question={field.question}
                    onChange={(value) => setResponses({ ...responses, [field.question]: value })}
                  />
                  {errors[field.question] && (
                    <p className="text-red-500">{errors[field.question]}</p>
                  )}
                </div>
              )
            );
          }
        })}
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Submit Survey
        </button>
      </form>
    </div>
  );
}
