// /pages/admin/results/[id].tsx
"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { FaDownload } from "react-icons/fa";

type SurveyResult = {
  [question: string]: string;
};

export default function ResultsPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [surveyTitle, setSurveyTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<number | null>(null); // State to track zipping progress

  const parseCSV = (text: string) => {
    const lines = text.split("\n").filter(Boolean);
    const headerLine = lines.shift();
    if (!headerLine) return [];
    const headers =
      headerLine
        .match(/(?:^|,)(\"(?:[^\"]+|\"\")*\"|[^,]*)/g)
        ?.map((header) => header.replace(/^,|^"|"$/g, "").trim()) || [];
    return lines.map((line) => {
      const values =
        line
          .match(/(?:^|,)(\"(?:[^\"]+|\"\")*\"|[^,]*)/g)
          ?.map((value) => value.replace(/^,|^"|"$/g, "").trim()) || [];
      const result: Record<string, string> = {};
      headers.forEach((header, index) => {
        result[header] = values[index] || "";
      });
      return result;
    });
  };

  useEffect(() => {
    if (id) {
      // Fetch survey details for title
      const titlePromise = fetch(`/api/surveys/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch survey details");
          return res.json();
        })
        .then((data) => {
          if (data && data.title) {
            setSurveyTitle(data.title);
          }
        })
        .catch((error) => console.error("Error fetching survey details:", error));

      const resultsPromise = fetch(`/api/surveys/${id}/results-csv`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch results CSV");
          return res.text();
        })
        .then((csvText) => {
          const parsedResults = parseCSV(csvText);
          setResults(parsedResults);
        })
        .catch((error) => {
          console.error("Error fetching results:", error);
        });

      Promise.all([titlePromise, resultsPromise]).finally(() => {
        setLoading(false);
      });
    }
  }, [id]);

  const handleSaveResults = async () => {
    const zip = new JSZip();
    const filePromises: Promise<void>[] = [];
    setProgress(0); // Initialize progress

    const sanitizedTitle = (surveyTitle
      ? surveyTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      : "survey") || "survey";

        let timestamp = new Date().toISOString().substring(0, 16).replace(/:/g, "-");
        // Try to use the first timestamp from results if available
        if (results.length > 0 && results[0]["Timestamp"]) {
          // Check if the timestamp is already formatted or needs formatting (CSV stores as string)
          let firstTs = results[0]["Timestamp"];
          // Simple check if it looks like a date
          if (firstTs) {
            // Ensure we use the short format "YYYY-MM-DDTHH:mm"
            if (firstTs.length > 16) {
              firstTs = firstTs.substring(0, 16);
            }
            timestamp = firstTs.replace(/:/g, "-").replace(/\./g, "-");
          }
        }

        const baseFilename = `${sanitizedTitle}-${timestamp}`;

    // Add the original CSV file to the zip
    filePromises.push(
      fetch(`/api/surveys/${id}/results-csv`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch CSV file");
          return res.blob();
        })
        .then((blob) => {
          zip.file(`${baseFilename}.csv`, blob);
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
                  if (!res.ok)
                    throw new Error(`Failed to fetch file: ${filePath}`);
                  return res.blob();
                })
                .then((blob) => {
                  zip.file(`data/uploads/${fileName}`, blob); // Store file in zip as-is
                })
            );
          }
        }
      });
    });

    // Wait for all file fetches to complete
    await Promise.all(filePromises);

    // Generate the zip file with progress feedback
    zip
      .generateAsync({ type: "blob" }, (metadata) => {
        // Update progress based on metadata percent
        setProgress(Math.round(metadata.percent));
      })
      .then((blob) => {
        saveAs(blob, `${baseFilename}.zip`);
        setProgress(null); // Reset progress after completion
      })
      .catch((error) => {
        console.error("Error generating zip file:", error);
        alert("Failed to save results. Please try again.");
        setProgress(null);
      });
  };

  if (loading)
    return (
      <p className="text=center text-2xl container mt-20 mx-auto">Loading...</p>
    );

  if (results.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center mt-14">
        <p className="text-lg font-semibold">
          No results available for this survey.
        </p>
        <button
          onClick={() => router.push("/admin")}
          className="mt-5 px-5 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-150"
        >
          Return to Admin
        </button>
      </div>
    );
  }

  const headers = Object.keys(results[0]);

  return (
    <div className="container mx-auto p-4 mt-10 mb-5">
      <div className="bg-white p-5 mb-10 rounded-2xl">
        <h1 className="text-4xl font-bold mb-5 text-center">Survey Results</h1>

        {/* Buttons to go back and save results */}
        <div className="mb-14 flex gap-4 flex-wrap justify-center">
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-500 transition-transform transform hover:scale-105"
          >
            Return to Admin
          </button>
          <button
            onClick={handleSaveResults}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-500 transition-transform transform hover:scale-105 cursor-pointer"
          >
            <FaDownload className="text-lg" />
            Save Results
          </button>
        </div>

        {/* Progress Notification */}
        {progress !== null && (
          <div className="text-center text-2xl mt-4 mb-4">
            Zipping files... {progress}% completed
          </div>
        )}

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-2 border-gray-600">
            <thead>
              <tr>
                {headers.map((question, index) => (
                  <th
                    key={index}
                    className="border-2 border-gray-600 px-4 py-2 font-semibold text-left whitespace-nowrap"
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
                    <td
                      key={cellIndex}
                      className="border px-4 py-2 whitespace-nowrap"
                    >
                      {result[question]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
