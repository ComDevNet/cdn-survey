'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Survey } from '../types/survey';
import { FiArrowRight, FiClipboard } from 'react-icons/fi';

export default function HomePage() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const res = await fetch('/api/surveys');
        if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <div className="pt-20 pb-12 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-semibold mb-6">
          <FiClipboard className="opacity-80" />
          Community Development Network
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
          CDN Survey Portal
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Select a survey below to share your feedback and help us build stronger communities.
        </p>
      </div>

      {/* Survey Grid */}
      <div className="container mx-auto px-4 pb-20 max-w-5xl">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-card border border-border rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive font-semibold text-lg">{error}</p>
          </div>
        ) : visibleSurveys.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleSurveys.map((survey) => (
              <div
                key={survey.id}
                className="group flex flex-col justify-between p-7 border border-border rounded-3xl bg-card shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 cursor-pointer"
                onClick={() => router.push(`/survey/${survey.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && router.push(`/survey/${survey.id}`)}
                aria-label={`Take the survey titled ${survey.title}`}
              >
                <div>
                  <h2 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                    {survey.title}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {survey.description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {survey.formFields?.length ?? 0} question{survey.formFields?.length !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-primary group-hover:gap-3 transition-all">
                    Begin <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center gap-4 bg-card border border-border rounded-3xl p-12 shadow-sm max-w-sm mx-auto">
              <FiClipboard className="text-5xl text-muted-foreground/50" />
              <p className="text-lg font-semibold text-foreground">No surveys available</p>
              <p className="text-muted-foreground text-sm">Check back later or contact your administrator.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
