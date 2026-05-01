// /pages/admin/results/[id].tsx
"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { FaDownload, FaArrowLeft } from "react-icons/fa";

type SurveyResult = {
  [question: string]: string;
};

export default function ResultsPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [surveyTitle, setSurveyTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<number | null>(null);

  const parseCSV = (text: string) => {
    const lines = text.split("\n").filter(Boolean);
    const headerLine = lines.shift();
    if (!headerLine) return [];
    const headers =
      headerLine
        .match(/(?:^|,)(\"(?:[^\"]+|\"\")*\"|[^,]*)/g)
        ?.map((header) => header.replace(/^,|^\"|\"$/g, "").trim()) || [];
    return lines.map((line) => {
      const values =
        line
          .match(/(?:^|,)(\"(?:[^\"]+|\"\")*\"|[^,]*)/g)
          ?.map((value) => value.replace(/^,|^\"|\"$/g, "").trim()) || [];
      const result: Record<string, string> = {};
      headers.forEach((header, index) => {
        result[header] = values[index] || "";
      });
      return result;
    });
  };

  useEffect(() => {
    if (id) {
      const titlePromise = fetch(`/api/surveys/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch survey details");
          return res.json();
        })
        .then((data) => {
          if (data && data.title) setSurveyTitle(data.title);
        })
        .catch((error) => console.error("Error fetching survey details:", error));

      const resultsPromise = fetch(`/api/surveys/${id}/results-csv`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch results CSV");
          return res.text();
        })
        .then((csvText) => {
          setResults(parseCSV(csvText));
        })
        .catch((error) => console.error("Error fetching results:", error));

      Promise.all([titlePromise, resultsPromise]).finally(() => setLoading(false));
    }
  }, [id]);

  const handleSaveResults = async () => {
    const zip = new JSZip();
    const filePromises: Promise<void>[] = [];
    setProgress(0);

    const sanitizedTitle =
      (surveyTitle
        ? surveyTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
        : "survey") || "survey";

    let timestamp = new Date().toISOString().substring(0, 16).replace(/:/g, "-");
    if (results.length > 0 && results[0]["Timestamp"]) {
      let firstTs = results[0]["Timestamp"];
      if (firstTs) {
        if (firstTs.length > 16) firstTs = firstTs.substring(0, 16);
        timestamp = firstTs.replace(/:/g, "-").replace(/\./g, "-");
      }
    }

    const baseFilename = `${sanitizedTitle}-${timestamp}`;

    filePromises.push(
      fetch(`/api/surveys/${id}/results-csv`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch CSV file");
          return res.blob();
        })
        .then((blob) => { zip.file(`${baseFilename}.csv`, blob); })
    );

    results.forEach((result) => {
      Object.values(result).forEach((answer) => {
        if (answer.startsWith("data/uploads/")) {
          const fileName = answer.split("/").pop();
          if (fileName) {
            const filePath = `/api/surveys/files/${fileName}`;
            filePromises.push(
              fetch(filePath)
                .then((res) => {
                  if (!res.ok) throw new Error(`Failed to fetch file: ${filePath}`);
                  return res.blob();
                })
                .then((blob) => { zip.file(`data/uploads/${fileName}`, blob); })
            );
          }
        }
      });
    });

    await Promise.all(filePromises);

    zip
      .generateAsync({ type: "blob" }, (metadata) => {
        setProgress(Math.round(metadata.percent));
      })
      .then((blob) => {
        saveAs(blob, `${baseFilename}.zip`);
        setProgress(null);
      })
      .catch((error) => {
        console.error("Error generating zip file:", error);
        alert("Failed to save results. Please try again.");
        setProgress(null);
      });
  };

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-2xl text-muted-foreground font-semibold animate-pulse">Loading results…</p>
      </div>
    );

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-4">
        <div className="bg-card border border-border rounded-3xl p-10 text-center shadow-sm max-w-md w-full">
          <p className="text-xl font-semibold text-foreground mb-2">No results yet</p>
          <p className="text-muted-foreground mb-8">
            No responses have been recorded for this survey.
          </p>
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all mx-auto"
          >
            <FaArrowLeft /> Return to Admin
          </button>
        </div>
      </div>
    );
  }

  const headers = Object.keys(results[0]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="container mx-auto p-4 pt-10 mb-5">
        <div className="bg-card text-card-foreground border border-border p-6 md:p-10 mb-10 rounded-3xl shadow-sm">

          {/* Header */}
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-2 text-center text-foreground">Survey Results</h1>
          {surveyTitle && (
            <p className="text-center text-muted-foreground text-lg mb-8">{surveyTitle}</p>
          )}

          {/* Action Buttons */}
          <div className="mb-10 flex gap-4 flex-wrap justify-center">
            <button
              onClick={() => router.push("/admin")}
              className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground font-bold rounded-xl border border-border shadow-sm hover:bg-secondary/80 transition-transform transform hover:scale-105"
            >
              <FaArrowLeft className="opacity-80" /> Return to Admin
            </button>
            <button
              onClick={handleSaveResults}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-md hover:bg-primary/90 transition-transform transform hover:scale-105"
            >
              <FaDownload className="text-lg" /> Save Results (.zip)
            </button>
          </div>

          {/* Progress Bar */}
          {progress !== null && (
            <div className="mb-8">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Packaging results…</span>
                <span className="font-bold text-foreground">{progress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden border border-border">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats bar */}
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <div className="bg-background border border-border rounded-2xl px-6 py-4 text-center min-w-[120px]">
              <div className="font-heading text-3xl font-bold text-primary">{results.length}</div>
              <div className="text-xs text-muted-foreground font-semibold mt-1 uppercase tracking-wide">Responses</div>
            </div>
            <div className="bg-background border border-border rounded-2xl px-6 py-4 text-center min-w-[120px]">
              <div className="font-heading text-3xl font-bold text-primary">{headers.length}</div>
              <div className="text-xs text-muted-foreground font-semibold mt-1 uppercase tracking-wide">Questions</div>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
            <table className="min-w-full bg-background text-foreground">
              <thead>
                <tr className="bg-secondary text-secondary-foreground">
                  {headers.map((question, index) => (
                    <th
                      key={index}
                      className="border-b border-border px-5 py-4 font-bold text-left whitespace-nowrap text-sm uppercase tracking-wide"
                    >
                      {question}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((result, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-background" : "bg-secondary/30"}>
                    {headers.map((question, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border-b border-border/50 px-5 py-3.5 whitespace-nowrap text-sm text-foreground"
                      >
                        {result[question] || <span className="text-muted-foreground italic">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
