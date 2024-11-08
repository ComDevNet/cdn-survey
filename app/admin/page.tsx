'use client';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Survey } from "../../types/survey";

export default function AdminDashboard() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);

  useEffect(() => {
    // Fetch all surveys
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
          // Update local state to remove the deleted survey
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
        // Update local state to reflect the new visibility
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      {/* Create New Survey Button */}
      <div className="mb-6">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition"
          onClick={() => router.push("/admin/create")}
        >
          Create New Survey
        </button>
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

            {/* Buttons to Edit, View Results, Delete Survey, and Toggle Visibility */}
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
