"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Survey } from "../../types/survey";

export default function AdminDashboard() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);

  useEffect(() => {
    // Fetch all surveys
    fetch("/api/surveys")
      .then((res) => res.json())
      .then((data) => setSurveys(data));
  }, []);

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

            {/* Buttons to Edit Survey and View Results */}
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
