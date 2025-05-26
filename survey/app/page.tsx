'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Survey } from '../types/survey';

export default function HomePage() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const res = await fetch('/api/surveys');
        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setSurveys(data);
      } catch (error) {
        console.error('Failed to fetch surveys:', error);
        setError('Failed to load surveys. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  const visibleSurveys = surveys.filter((survey) => survey.visible);

  return (
    <div className="container mx-auto p-4 mt-14">
      <h1 className="text-4xl font-bold mb-6 text-center md:text-6xl">
        Welcome to the CDN Survey
      </h1>
      <p className="mb-20 text-lg text-center">
        Please select a survey to participate:
      </p>

      {isLoading ? (
        <p className="text-center text-gray-600">Loading surveys...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : visibleSurveys.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {visibleSurveys.map((survey) => (
            <div
              key={survey.id}
              className="flex flex-col justify-between p-7 border border-gray-200 rounded-xl bg-white shadow hover:shadow-lg transition-shadow duration-500"
            >
              <div>
                <h2 className="text-2xl font-semibold mb-3 text-gray-800 text-center">
                  {survey.title}
                </h2>
                <p className="text-gray-600 mb-5 text-center">{survey.description}</p>
              </div>
              <button
                className="mt-auto px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold duration-500"
                onClick={() => router.push(`/survey/${survey.id}`)}
                aria-label={`Take the survey titled ${survey.title}`}
              >
                Take Survey
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center">
          No surveys available at the moment. Please check back later.
        </p>
      )}
    </div>
  );
}
