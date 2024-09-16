"use client";

import { useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver"; // Install file-saver package

const Home = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [report, setReport] = useState<string | null>(null); // State to hold the generated report

  // Function to fetch data from the Clockify API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `/api/clockify?workspaceId=${workspaceId}&userId=${userId}`
      );
      console.log("API Response:", response.data);
      setData(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  // Function to generate report
  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("/api/generate-report", { data });
      setReport(response.data.report); // Assuming the response contains the report
    } catch (error: any) {
      setError(error.response?.data?.error || "Error generating report");
    } finally {
      setLoading(false);
    }
  };

  // Function to download LaTeX as PDF
  const downloadLatex = async () => {
    if (!report) {
      alert("Please generate a report first.");
      return;
    }

    try {
      const response = await axios.post("/api/generate-latex", { report });
      const latexCode = response.data.latexCode;

      // Convert LaTeX to PDF (this part depends on your implementation)
      // For example, you might send the LaTeX code to a server that generates the PDF
      const pdfBlob = await generatePdfFromLatex(latexCode); // Implement this function

      // Use FileSaver to download the PDF
      saveAs(pdfBlob, "report.pdf");
    } catch (error) {
      console.error("Error generating LaTeX:", error);
    }
  };

  const generatePdfFromLatex = async (latexCode: string) => {
    const response = await axios.post(
      "/api/compile-latex",
      { latexCode },
      {
        responseType: "blob", // Important for downloading files
      }
    );
    return response.data; // This should be the PDF blob
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <div className="w-full max-w-4xl p-6 bg-gray-800 rounded-xl shadow-lg">
        <h1 className="mb-10 text-3xl font-bold text-center">
          Clockify API Data
        </h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchData();
          }}
          className="mb-8"
        >
          <input
            type="text"
            placeholder="Workspace ID"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            className="px-4 py-2 mb-4 text-black"
            required
          />
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="px-4 py-2 mb-4 text-black"
            required
          />
          <button
            type="submit"
            className="px-6 py-3 text-white bg-blue-500 rounded-xl hover:bg-blue-600"
          >
            Fetch Data
          </button>
        </form>
        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {data.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Fetched Data</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {data.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 bg-gray-700 rounded-lg shadow"
                >
                  <h3 className="mb-2 text-xl font-semibold">
                    {entry.description}
                  </h3>
                  <p>
                    <strong>Start:</strong>{" "}
                    {new Date(entry.timeInterval.start).toLocaleString()}
                  </p>
                  <p>
                    <strong>End:</strong>{" "}
                    {new Date(entry.timeInterval.end).toLocaleString()}
                  </p>
                  <p>
                    <strong>Billable:</strong> {entry.billable ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Hourly Rate:</strong> {entry.hourlyRate.amount}{" "}
                    {entry.hourlyRate.currency}
                  </p>
                  <p>
                    <strong>Cost Rate:</strong> {entry.costRate.amount}{" "}
                    {entry.costRate.currency}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={generateReport}
              className="mt-4 px-6 py-3 text-white bg-green-500 rounded-xl hover:bg-green-600"
            >
              Generate Report
            </button>
          </>
        )}
        {report && (
          <div className="mt-4 p-6 bg-gray-700 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Generated Report</h2>
            <div
              className="text-lg"
              dangerouslySetInnerHTML={{ __html: report }}
            />
            <button
              onClick={downloadLatex}
              className="mt-4 px-6 py-3 text-white bg-purple-500 rounded-xl hover:bg-purple-600"
            >
              Download as PDF
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;
