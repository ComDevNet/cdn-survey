"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Survey } from "../../types/survey";

import { FaEdit, FaEye, FaTrash, FaEyeSlash, FaDownload, FaPlus, FaFileImport } from "react-icons/fa";

export default function AdminDashboard() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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
          setSurveys((prevSurveys) => prevSurveys.filter((survey) => survey.id !== id));
          alert("Survey deleted successfully");
        } else {
          console.error("Failed to delete survey");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const toggleVisibility = async (id: number, currentVisibility: any) => {
    try {
      const res = await fetch(`/api/surveys/${id}/toggle-visibility`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !currentVisibility }),
      });
      if (res.ok) {
        setSurveys((prevSurveys) =>
          prevSurveys.map((survey) =>
            survey.id === id ? { ...survey, visible: !currentVisibility } : survey
          )
        );
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
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${data.title || "survey"}-cdn-survey.json`;
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
      if (!file.name.includes("cdn-survey")) {
        alert("Invalid file. Please upload a JSON file with 'cdn-survey' in its name.");
        event.target.value = "";
        return;
      }

      try {
        const fileData = await file.text();
        const importedSurvey = JSON.parse(fileData);
        importedSurvey.visible = false;

        const existingSurvey = surveys.find(
          (survey) => survey.title === importedSurvey.title
        );

        if (existingSurvey) {
          const overwrite = confirm(
            `A survey with the title "${importedSurvey.title}" already exists. Do you want to overwrite it?`
          );

          if (overwrite) {
            const res = await fetch(`/api/surveys/${existingSurvey.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(importedSurvey),
            });

            if (res.ok) {
              alert("Survey overwritten successfully.");
              fetchSurveys();
            } else {
              console.error("Failed to overwrite survey");
              alert("Failed to overwrite survey.");
            }
          } else {
            alert("Import canceled.");
          }
        } else {
          const res = await fetch("/api/surveys", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(importedSurvey),
          });

          if (res.ok) {
            alert("Survey imported successfully.");
            fetchSurveys();
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

  const filteredSurveys = surveys.filter((survey) =>
    survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    survey.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="container mx-auto p-4 pt-14 mb-10">
        <h1 className="font-heading text-4xl font-bold mb-6 text-center md:text-6xl text-foreground">
          Admin Dashboard
        </h1>

        <div className="mb-8 flex justify-center">
          <input
            type="text"
            placeholder="Search surveys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-6 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
          />
        </div>

      <div className="mb-10 flex gap-4 flex-wrap justify-center">
        <button
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-transform transform hover:scale-105"
          onClick={() => router.push("/admin/create")}
        >
          <FaPlus className="text-xl" />
          Create New Survey
        </button>
        <label className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground font-bold rounded-xl border border-border shadow-sm hover:bg-secondary/80 transition-transform transform hover:scale-105 cursor-pointer">
          <FaFileImport className="text-xl" />
          Import Survey
          <input
            type="file"
            accept=".json"
            onChange={handleImportSurvey}
            className="hidden"
          />
        </label>
      </div>

      {surveys.length === 0 ? (
        <div className="text-center text-muted-foreground mt-10">
          <p className="text-lg">There are no surveys available.</p>
          <p className="text-md">
            Please create a new survey or import an existing one.
          </p>
        </div>
      ) : filteredSurveys.length === 0 ? (
        <div className="text-center text-muted-foreground mt-10">
          <p className="text-lg">No surveys match your search.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredSurveys.map((survey) => (
            <div
              key={survey.id || survey.title}
              className="flex flex-col p-6 border border-border rounded-3xl shadow-sm bg-card text-card-foreground h-full transition-shadow hover:shadow-md"
            >
              <h2 className="font-heading text-xl font-bold mb-2 text-center text-foreground">{survey.title}</h2>
              <p className="text-sm mb-4 text-center text-muted-foreground">{survey.description}</p>
              <p className="text-xs font-semibold mb-6 text-center px-4 py-1.5 bg-secondary text-secondary-foreground rounded-full w-fit mx-auto border border-border/50">
                Status: <span className="font-bold tracking-wide">{survey.visible ? "VISIBLE" : "HIDDEN"}</span>
              </p>

              <div className="grid grid-cols-2 gap-3 mt-auto">
                <button
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl border border-border shadow-sm hover:bg-secondary/80 transition-all hover:border-primary/50"
                  onClick={() => router.push(`/admin/edit/${survey.id}`)}
                >
                  <FaEdit className="text-lg opacity-80" /> Edit
                </button>

                <button
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl border border-border shadow-sm hover:bg-secondary/80 transition-all hover:border-primary/50"
                  onClick={() => router.push(`/admin/results/${survey.id}`)}
                >
                  <FaEye className="text-lg opacity-80" /> Results
                </button>

                <button
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-destructive text-destructive-foreground font-semibold rounded-xl shadow-sm hover:bg-destructive/90 transition-all"
                  onClick={() => handleDeleteSurvey(survey.id)}
                >
                  <FaTrash className="text-lg opacity-80" /> Delete
                </button>

                <button
                  className={`flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-xl border transition-all ${
                    survey.visible ? "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80 hover:border-primary/50" : "bg-muted text-muted-foreground border-transparent hover:bg-secondary hover:text-secondary-foreground"
                  }`}
                  onClick={() => toggleVisibility(survey.id, survey.visible)}
                >
                  {survey.visible ? (
                    <>
                      <FaEyeSlash className="text-lg opacity-80" />
                      Hide
                    </>
                  ) : (
                    <>
                      <FaEye className="text-lg opacity-80" />
                      Show
                    </>
                  )}
                </button>

                <button
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl border border-border shadow-sm hover:bg-secondary/80 transition-all hover:border-primary/50 col-span-2"
                  onClick={() => handleExportSurvey(survey.id)}
                >
                  <FaDownload className="text-lg opacity-80" /> Export JSON
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
  );
}
