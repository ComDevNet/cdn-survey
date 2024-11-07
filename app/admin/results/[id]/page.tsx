'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type SurveyResult = {
  [question: string]: string;
};

export default function ResultsPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to parse CSV text to JSON
  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(Boolean);
  
    // Use the first line as headers
    const headerLine = lines.shift();
    if (!headerLine) return [];
  
    // Split headers using a regex to handle quoted headers with commas
    const headers = headerLine.match(/(?:^|,)(\"(?:[^\"]+|\"\")*\"|[^,]*)/g)?.map(header => header.replace(/^,|^"|"$/g, '').trim()) || [];
  
    // Process each line into an object
    return lines.map(line => {
      const values = line.match(/(?:^|,)(\"(?:[^\"]+|\"\")*\"|[^,]*)/g)?.map(value => value.replace(/^,|^"|"$/g, '').trim()) || [];
      const result: Record<string, string> = {};
      headers.forEach((header, index) => {
        result[header] = values[index] || '';
      });
      return result;
    });
  };
  
  

  useEffect(() => {
    if (id) {
      fetch(`/api/surveys/${id}/results-csv`)
        .then((res) => res.text())
        .then((csvText) => {
          const parsedResults = parseCSV(csvText);
          setResults(parsedResults);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching results:', error);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <p>Loading...</p>;

  if (results.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg">No results available for this survey.</p>
        <button
          onClick={() => router.push('/admin')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Return to Admin
        </button>
      </div>
    );
  }

  const headers = Object.keys(results[0]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Survey Results</h1>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            {headers.map((question, index) => (
              <th key={index} className="border px-4 py-2 font-semibold text-left">
                {question}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((result, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((question, cellIndex) => (
                <td key={cellIndex} className="border px-4 py-2">
                  {result[question]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
