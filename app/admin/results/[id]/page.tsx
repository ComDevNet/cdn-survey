// /pages/admin/results/[id].tsx
"use client";
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

type SurveyResult = {
  [question: string]: string;
};

export default function ResultsPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<number | null>(null); // State to track zipping progress

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(Boolean);
    const headerLine = lines.shift();
    if (!headerLine) return [];
    const headers = headerLine.match(/(?:^|,)(\"(?:[^\"]+|\"\")*\"|[^,]*)/g)?.map(header => header.replace(/^,|^"|"$/g, '').trim()) || [];
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

  const handleSaveResults = async () => {
    const zip = new JSZip();
    const filePromises: Promise<void>[] = [];
    setProgress(0); // Initialize progress

    // Add the original CSV file to the zip
    filePromises.push(
      fetch(`/api/surveys/${id}/results-csv`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch CSV file");
          return res.blob();
        })
        .then((blob) => {
          zip.file(`survey_${id}_results.csv`, blob);
        })
    );

    // Copy each linked file from `data/uploads/` via the API endpoint
    results.forEach((result) => {
      Object.values(result).forEach((answer) => {
        if (answer.startsWith("data/uploads/")) {
          const fileName = answer.split("/").pop();
          if (fileName) {
            const filePath = `/api/surveys/files/${fileName}`;

            // Fetch file from API and add it to zip
            filePromises.push(
              fetch(filePath)
                .then((res) => {
                  if (!res.ok) throw new Error(`Failed to fetch file: ${filePath}`);
                  return res.blob();
                })
                .then((blob) => {
                  zip.file(`data/uploads/${fileName}`, blob);  // Store file in zip as-is
                })
            );
          }
        }
      });
    });

    // Wait for all file fetches to complete
    await Promise.all(filePromises);

    // Generate the zip file with progress feedback
    zip.generateAsync(
      { type: "blob" },
      (metadata) => {
        // Update progress based on metadata percent
        setProgress(Math.round(metadata.percent));
      }
    ).then((blob) => {
      saveAs(blob, `survey_${id}_results.zip`);
      setProgress(null); // Reset progress after completion
    }).catch((error) => {
      console.error("Error generating zip file:", error);
      alert("Failed to save results. Please try again.");
      setProgress(null);
    });
  };

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

      {/* Buttons to go back and save results */}
      <div className="mb-4 flex gap-4">
        <button
          onClick={() => router.push('/admin')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
        >
          Return to Admin
        </button>
        <button
          onClick={handleSaveResults}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition"
        >
          Save Results
        </button>
      </div>

      {/* Progress Notification */}
      {progress !== null && (
        <div className="text-center text-lg mt-4">
          Zipping files... {progress}% completed
        </div>
      )}

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              {headers.map((question, index) => (
                <th
                  key={index}
                  className="border px-4 py-2 font-semibold text-left whitespace-nowrap"
                >
                  {question}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((result, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((question, cellIndex) => (
                  <td key={cellIndex} className="border px-4 py-2 whitespace-nowrap">
                    {result[question]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
