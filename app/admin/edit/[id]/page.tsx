'use client';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Survey, SurveyField } from '../../../../types/survey';

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
          setSurvey(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching survey:', error);
          setLoading(false);
        });
    }
  }, [id]);

  const handleUpdateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (survey) {
      await fetch(`/api/surveys/${id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(survey),
      });
      router.push('/admin');
    }
  };

  const handleCancel = () => {
    router.push('/admin');
  };

  // Function to add a new question
  const addQuestion = () => {
    if (survey) {
      const newQuestion: SurveyField = { type: 'text', question: '' };
      setSurvey({
        ...survey,
        formFields: [...survey.formFields, newQuestion],
      });
    }
  };

  // Function to delete a question
  const deleteQuestion = (index: number) => {
    if (survey) {
      const updatedFields = survey.formFields.filter((_, i) => i !== index);
      setSurvey({
        ...survey,
        formFields: updatedFields,
      });
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!survey) return <p>Error: Survey not found.</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Survey: {survey.title}</h1>
      
      <form onSubmit={handleUpdateSurvey} className="space-y-4">
        {survey.formFields.map((field, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="flex-grow">
              <label>Question {index + 1}</label>
              <input
                type="text"
                value={field.question}
                onChange={(e) =>
                  setSurvey({
                    ...survey,
                    formFields: survey.formFields.map((f, i) =>
                      i === index ? { ...f, question: e.target.value } : f
                    ),
                  })
                }
                className="border px-2 py-1 rounded w-full"
              />
            </div>
            <button
              type="button"
              onClick={() => deleteQuestion(index)}
              className="px-2 py-1 bg-red-600 text-white rounded"
            >
              Delete
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
        >
          Add Question
        </button>

        <div className="flex space-x-4 mt-6">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            Update Survey
          </button>
          <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-600 text-white rounded">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
