'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateSurvey() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  interface FormField {
    type: string;
    question: string;
    required: boolean; // Add required property
    options?: string[];
  }

  const [formFields, setFormFields] = useState<FormField[]>([{ type: 'text', question: '', required: false, options: [] }]);
  const router = useRouter();

  const addField = (type: string) => {
    const newField = { type, question: '', required: false, options: type === 'radio' || type === 'checkbox' ? [''] : undefined };
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
      updatedFields[index].options = [...updatedFields[index].options, ''];
      setFormFields(updatedFields);
    }
  };

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const updatedFields = [...formFields];
    if (updatedFields[fieldIndex].options) {
      updatedFields[fieldIndex].options[optionIndex] = value;
      setFormFields(updatedFields);
    }
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const updatedFields = [...formFields];
    if (updatedFields[fieldIndex].options) {
      updatedFields[fieldIndex].options = updatedFields[fieldIndex].options.filter((_, i) => i !== optionIndex);
      setFormFields(updatedFields);
    }
  };

  const deleteQuestion = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, formFields }),
    });
    router.push('/admin');
  };

  const handleCancel = () => {
    router.push('/admin'); // Navigate back to the admin page
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Survey</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Title Input Field */}
        <div>
          <label>Survey Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border px-2 py-1 rounded w-full"
            placeholder="Enter survey title"
            required
          />
        </div>
        
        {/* Description Input Field */}
        <div>
          <label>Survey Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border px-2 py-1 rounded w-full"
            placeholder="Enter survey description"
            rows={4}
            required
          />
        </div>
        
        {/* Dynamic Form Fields for Questions */}
        {formFields.map((field, index) => (
          <div key={index} className="space-y-2 border border-gray-300 p-4 rounded">
            <div className="flex items-center justify-between">
              <label>Question {index + 1}</label>
              <button
                type="button"
                onClick={() => deleteQuestion(index)}
                className="px-2 py-1 bg-red-600 text-white rounded"
              >
                Delete Question
              </button>
            </div>
            <select
              value={field.type}
              onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
              className="border px-2 py-1 rounded w-full mb-2"
            >
              <option value="text">Text Input</option>
              <option value="textarea">Textarea</option>
              <option value="radio">Radio Button</option>
              <option value="checkbox">Checkbox</option>
            </select>

            {field.type === 'textarea' ? (
              <textarea
                value={field.question}
                onChange={(e) => handleFieldChange(index, 'question', e.target.value)}
                className="border px-2 py-1 rounded w-full"
                placeholder="Enter question text"
                rows={4}
              />
            ) : (
              <input
                type="text"
                value={field.question}
                onChange={(e) => handleFieldChange(index, 'question', e.target.value)}
                className="border px-2 py-1 rounded w-full"
                placeholder="Enter question text"
              />
            )}

            {/* Checkbox for setting the question as required */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
              />
              <label>Required</label>
            </div>

            {/* Render Options for Radio and Checkbox */}
            {(field.type === 'radio' || field.type === 'checkbox') && (
              <div>
                <label>Options:</label>
                {field.options && field.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-2 mb-1">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, optIndex, e.target.value)}
                      className="border px-2 py-1 rounded w-full"
                      placeholder={`Option ${optIndex + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(index, optIndex)}
                      className="px-2 py-1 bg-red-600 text-white rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(index)}
                  className="px-2 py-1 bg-blue-600 text-white rounded"
                >
                  Add Option
                </button>
              </div>
            )}
          </div>
        ))}
        
        {/* Buttons for Adding Fields */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => addField('text')}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Add Text Field
          </button>
          <button
            type="button"
            onClick={() => addField('textarea')}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Add Textarea
          </button>
          <button
            type="button"
            onClick={() => addField('radio')}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Add Radio Button
          </button>
          <button
            type="button"
            onClick={() => addField('checkbox')}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Add Checkbox
          </button>
        </div>

        {/* Submit and Cancel Buttons */}
        <div className="flex space-x-4 mt-6">
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
            Create Survey
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
