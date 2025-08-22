"use client";
import { useState } from "react";

export default function Page() {
  const [projectName, setProjectName] = useState("");
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !projectFile) {
      setMessage("Please fill in all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("projectName", projectName);
    formData.append("projectFile", projectFile);

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:8000/codefiles/create_project", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setMessage("Project created successfully!");
      } else {
        const error = await res.text();
        setMessage(`Error: ${error}`);
      }
    } catch (err) {
      setMessage("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-96 space-y-4"
      >
        <h1 className="text-xl font-bold text-center">Create Project</h1>
        
        <input
          type="text"
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded-lg"
        />

        <input
          type="file"
          onChange={(e) => setProjectFile(e.target.files?.[0] || null)}
          className="w-full border border-gray-300 p-2 rounded-lg"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          {loading ? "Creating..." : "Create Project"}
        </button>

        {message && (
          <p className="text-center text-sm text-gray-700 mt-2">{message}</p>
        )}
      </form>
    </div>
  );
}
