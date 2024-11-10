"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Survey } from "../../types/survey";

import { FaEdit, FaEye, FaTrash, FaEyeSlash, FaDownload, FaPlus, FaFileImport } from "react-icons/fa";

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

  return (
    <div className="container mx-auto p-4 mt-14 mb-10">
      <h1 className="text-4xl font-bold mb-6 text-center md:text-6xl">
        Admin Dashboard
      </h1>

      <div className="mb-10 flex gap-4 flex-wrap justify-center">
        <button
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-500 transition-transform transform hover:scale-105"
          onClick={() => router.push("/admin/create")}
        >
          <FaPlus className="text-xl" />
          Create New Survey
        </button>
        <label className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-500 transition-transform transform hover:scale-105 cursor-pointer">
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
        <div className="text-center text-gray-600 mt-10">
          <p className="text-lg">There are no surveys available.</p>
          <p className="text-md">
            Please create a new survey or import an existing one.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {surveys.map((survey) => (
            <div
              key={survey.id || survey.title} // Ensures a unique key even if id is missing
              className="flex flex-col p-6 border rounded-2xl shadow bg-white h-full"
            >
              <h2 className="text-xl font-bold mb-2 text-center">{survey.title}</h2>
              <p className="text-sm mb-3 text-center">{survey.description}</p>
              <p className="text-sm mb-5 text-center">
                Status: {survey.visible ? "Visible" : "Hidden"}
              </p>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-4 sm:flex-wrap mt-auto">
                <button
                  className="flex items-center gap-2 px-5 py-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-500 transition-transform transform hover:scale-105"
                  onClick={() => router.push(`/admin/edit/${survey.id}`)}
                >
                  <FaEdit className="text-lg" />
                  Edit
                </button>

                <button
                  className="flex items-center gap-2 px-5 py-4 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-500 transition-transform transform hover:scale-105"
                  onClick={() => router.push(`/admin/results/${survey.id}`)}
                >
                  <FaEye className="text-lg" />
                  Results
                </button>

                <button
                  className="flex items-center gap-2 px-5 py-4 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-500 transition-transform transform hover:scale-105"
                  onClick={() => handleDeleteSurvey(survey.id)}
                >
                  <FaTrash className="text-lg" />
                  Delete
                </button>

                <button
                  className={`flex items-center gap-2 px-5 py-4 rounded-lg shadow-md hover:bg-gray-500 transition-transform transform hover:scale-105 ${
                    survey.visible ? "bg-gray-600" : "bg-gray-400"
                  } text-white`}
                  onClick={() => toggleVisibility(survey.id, survey.visible)}
                >
                  {survey.visible ? (
                    <>
                      <FaEyeSlash className="text-lg" />
                      Hide
                    </>
                  ) : (
                    <>
                      <FaEye className="text-lg" />
                      Show
                    </>
                  )}
                </button>

                <button
                  className="flex items-center gap-2 px-5 py-4 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-400 transition-transform transform hover:scale-105"
                  onClick={() => handleExportSurvey(survey.id)}
                >
                  <FaDownload className="text-lg" />
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
