'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import TextInput from '../../../components/TextInput';
import TextArea from '../../../components/TextArea';
import RadioButton from '../../../components/RadioButton';
import Checkbox from '../../../components/Checkbox';
import FileUpload from '../../../components/FileUpload';
import { Survey, SurveyField, RadioButtonField, CheckboxField } from '../../../types/survey';

export default function SurveyPage() {
  const params = useParams();
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
        
        Object.entries(responses).forEach(([key, value]) => {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        });

        console.log("FormData submission: ", formData);

        const response = await fetch(`/api/surveys/${id}/results`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          setSuccessMessage('Survey submitted successfully!');
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
          const FieldComponent =
            field.type === 'text'
              ? TextInput
              : field.type === 'textarea'
              ? TextArea
              : field.type === 'radio'
              ? RadioButton
              : field.type === 'checkbox'
              ? Checkbox
              : field.type === 'file'
              ? FileUpload
              : null;

          return (
            FieldComponent && (
              <div key={index} className="mb-4">
                <FieldComponent
                  question={field.question}
                  options={'options' in field ? (field as RadioButtonField | CheckboxField).options ?? [] : []}
                  onChange={(value) => setResponses({ ...responses, [field.question]: value })}
                />
                {errors[field.question] && (
                  <p className="text-red-500">{errors[field.question]}</p>
                )}
              </div>
            )
          );
        })}
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Submit Survey
        </button>
      </form>
    </div>
  );
}
