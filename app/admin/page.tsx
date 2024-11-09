// /pages/admin/index.tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Survey } from "../../types/survey";

export default function AdminDashboard() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = () => {
    fetch("/api/surveys")
      .then((res) => res.json())
      .then((data) => setSurveys(data));
  };

  const handleDeleteSurvey = async (id: number) => {
    const confirmed = confirm("Are you sure you want to delete this survey?");
    if (confirmed) {
      try {
        const res = await fetch(`/api/surveys/${id}`, { method: "DELETE" });
        if (res.ok) {
          setSurveys(surveys.filter((survey) => survey.id !== id));
          alert("Survey deleted successfully");
        } else {
          console.error("Failed to delete survey");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const toggleVisibility = async (id: number, currentVisibility: boolean) => {
    try {
      const res = await fetch(`/api/surveys/${id}/toggle-visibility`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !currentVisibility })
      });
      if (res.ok) {
        setSurveys(surveys.map(survey => 
          survey.id === id ? { ...survey, visible: !currentVisibility } : survey
        ));
        alert(`Survey ${!currentVisibility ? "shown" : "hidden"} successfully`);
      } else {
        console.error("Failed to toggle visibility");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleExportSurvey = async (id: number) => {
    try {
      const res = await fetch(`/api/surveys/${id}`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${data.title || "survey"}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting survey:", error);
    }
  };

  const handleImportSurvey = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const fileData = await file.text();
        const importedSurvey = JSON.parse(fileData);

        // Set the imported survey's visibility to false by default
        importedSurvey.visible = false;

        // Check if a survey with the same title already exists
        const existingSurvey = surveys.find((survey) => survey.title === importedSurvey.title);

        if (existingSurvey) {
          // Ask the admin if they want to overwrite the existing survey
          const overwrite = confirm(
            `A survey with the title "${importedSurvey.title}" already exists. Do you want to overwrite it?`
          );

          if (overwrite) {
            // Overwrite the existing survey
            const res = await fetch(`/api/surveys/${existingSurvey.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(importedSurvey),
            });

            if (res.ok) {
              alert("Survey overwritten successfully.");
              fetchSurveys(); // Refresh the surveys list
            } else {
              console.error("Failed to overwrite survey");
              alert("Failed to overwrite survey.");
            }
          } else {
            alert("Import canceled.");
          }
        } else {
          // If no survey with the same title exists, create a new survey
          const res = await fetch("/api/surveys", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(importedSurvey),
          });

          if (res.ok) {
            alert("Survey imported successfully.");
            fetchSurveys(); // Refresh surveys list
          } else {
            console.error("Failed to import survey");
            alert("Failed to import survey.");
          }
        }
      } catch (error) {
        console.error("Error importing survey:", error);
        alert("Failed to import survey. Please check the file format.");
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      {/* Import and Create Survey Buttons */}
      <div className="mb-6 flex gap-4">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition"
          onClick={() => router.push("/admin/create")}
        >
          Create New Survey
        </button>
        <label className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition cursor-pointer">
          Import Survey
          <input
            type="file"
            accept=".json"
            onChange={handleImportSurvey}
            className="hidden"
          />
        </label>
      </div>

      {/* Surveys List */}
      <div className="grid gap-4">
        {surveys.map((survey) => (
          <div key={survey.id} className="p-4 border rounded-lg shadow">
            <h2 className="text-xl font-bold mb-2">{survey.title}</h2>
            <p className="text-sm mb-3">{survey.description}</p>
            <p className="text-sm mb-3">
              Status: {survey.visible ? "Visible" : "Hidden"}
            </p>

            {/* Buttons to Edit, View Results, Delete, Toggle Visibility, and Export */}
            <div className="flex gap-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
                onClick={() => router.push(`/admin/edit/${survey.id}`)}
              >
                Edit Survey
              </button>

              <button
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500 transition"
                onClick={() => router.push(`/admin/results/${survey.id}`)}
              >
                View Results
              </button>

              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition"
                onClick={() => handleDeleteSurvey(survey.id)}
              >
                Delete Survey
              </button>

              <button
                className={`px-4 py-2 rounded hover:bg-gray-500 transition ${
                  survey.visible ? "bg-gray-600" : "bg-gray-400"
                } text-white`}
                onClick={() => toggleVisibility(survey.id, survey.visible)}
              >
                {survey.visible ? "Hide" : "Show"}
              </button>

              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-400 transition"
                onClick={() => handleExportSurvey(survey.id)}
              >
                Export Survey
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
