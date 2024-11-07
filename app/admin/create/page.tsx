'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateSurvey() {
  const [title, setTitle] = useState(''); 
  const [formFields, setFormFields] = useState([{ type: 'text', question: '' }]);
  const router = useRouter();

  const addField = (type: string) => setFormFields([...formFields, { type, question: '' }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Send survey creation data to the backend with title
    await fetch('/api/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, formFields }), 
    });

    router.push('/admin');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Survey</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Title Input Field */}
        <div>
          <label>Survey Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border px-2 py-1 rounded w-full"
            placeholder="Enter survey title"
          />
        </div>
        
        {/* Dynamic Form Fields for Questions */}
        {formFields.map((field, index) => (
          <div key={index}>
            <label>Question {index + 1}</label>
            <input
              type="text"
              value={field.question}
              onChange={(e) =>
                setFormFields(
                  formFields.map((f, i) =>
                    i === index ? { ...f, question: e.target.value } : f
                  )
                )
              }
              className="border px-2 py-1 rounded w-full"
            />
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => addField('text')}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add Text Field
        </button>
        
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
          Create Survey
        </button>
      </form>
    </div>
  );
}
