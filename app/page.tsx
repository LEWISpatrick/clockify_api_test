'use client'

import { useState } from 'react';
import axios from 'axios';

// Utility function to parse ISO 8601 duration format to minutes
const parseDurationToMinutes = (duration: string | null | undefined): number => {
  if (!duration) return 0;

  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;

  const hours = match[1] ? parseInt(match[1].slice(0, -1), 10) : 0;
  const minutes = match[2] ? parseInt(match[2].slice(0, -1), 10) : 0;
  const seconds = match[3] ? parseInt(match[3].slice(0, -1), 10) : 0;

  return hours * 60 + minutes + (seconds / 60);
};

// Function to parse duration to a readable format
const parseDuration = (duration: string | null | undefined): string => {
  if (!duration) return 'N/A';

  const totalMinutes = parseDurationToMinutes(duration);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60); // Round the minutes

  return `${hours}h ${minutes}m`;
};

const Home = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch data from the Clockify API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/clockify');
      console.log('API Response:', response.data); // Log the response data
      setData(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total duration in minutes and convert to hours and minutes
  const calculateTotalDuration = () => {
    const totalMinutes = data.reduce((acc, entry) => acc + parseDurationToMinutes(entry.timeInterval.duration), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60); // Round the minutes
    return `${hours}h ${minutes}m`;
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <div className="w-full max-w-4xl p-6 bg-gray-800 rounded-xl shadow-lg">
        <h1 className="mb-10 text-3xl font-bold text-center">Clockify API Data</h1>
        <div className='text-center'>
          <button
            onClick={fetchData}
            className="px-6 py-3 mb-8 text-white bg-blue-500 rounded-xl hover:bg-blue-600"
          >
            Get My Data
          </button>
        </div>
        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {data.length > 0 && (
          <>
           
            <div className="grid gap-6 lg:grid-cols-2">
              {data.map((entry) => (
                <div key={entry.id} className="p-4 bg-gray-700 rounded-lg shadow">
                  <h2 className="mb-2 text-xl font-semibold">{entry.description}</h2>
                  <p><strong>Start:</strong> {new Date(entry.timeInterval.start).toLocaleString()}</p>
                  <p><strong>End:</strong> {new Date(entry.timeInterval.end).toLocaleString()}</p>
                  <p><strong>Duration:</strong> {parseDuration(entry.timeInterval.duration)}</p>
                  <p><strong>Billable:</strong> {entry.billable ? 'Yes' : 'No'}</p>
                  <p><strong>Hourly Rate:</strong> {entry.hourlyRate.amount} {entry.hourlyRate.currency}</p>
                  <p><strong>Cost Rate:</strong> {entry.costRate.amount} {entry.costRate.currency}</p>
                </div>
              ))}
            </div>
            {/* Display total hours spent */}
            <div className="mt-8 text-center">
              <h3 className="text-xl font-semibold">Total Hours Spent This Week: {calculateTotalDuration()}</h3>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Home;
