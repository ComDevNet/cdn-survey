'use client'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Survey } from '../types/survey';

export default function HomePage() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);

  useEffect(() => {
    fetch('/api/surveys')
      .then((res) => res.json())
      .then((data) => setSurveys(data));
  }, []);

  const visibleSurveys = surveys.filter(survey => survey.visible); // Filter surveys with visible set to true

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to the CDN Survey</h1>
      <p className="mb-8">Please select a survey to participate:</p>

      {/* Button to Admin Page */}
      <div className="mb-8">
        <button
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
          onClick={() => router.push('/admin')}
        >
          Admin Dashboard
        </button>
      </div>

      {/* List of Surveys or No Surveys Message */}
      <div className="grid gap-4">
        {visibleSurveys.length > 0 ? (
          visibleSurveys.map((survey) => (
            <div key={survey.id} className="p-4 border rounded-lg shadow">
              <h2 className="text-xl font-bold">{survey.title}</h2>
              <p>{survey.description}</p>
              <button
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
                onClick={() => router.push(`/survey/${survey.id}`)}
              >
                Take Survey
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center">No surveys available at the moment. Please check back later.</p>
        )}
      </div>
    </div>
  );
}
