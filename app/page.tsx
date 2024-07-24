'use client'
import { useState } from 'react';
import axios from 'axios';

const parseDuration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return duration;

  const hours = match[1] ? match[1].slice(0, -1) : '0';
  const minutes = match[2] ? match[2].slice(0, -1) : '0';
  const seconds = match[3] ? match[3].slice(0, -1) : '0';

  return `${hours}h ${minutes}m ${seconds}s`;
};

const isDurationMoreThanFiveSeconds = (duration: string): boolean => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return false;

  const hours = parseInt(match[1] ? match[1].slice(0, -1) : '0', 10);
  const minutes = parseInt(match[2] ? match[2].slice(0, -1) : '0', 10);
  const seconds = parseInt(match[3] ? match[3].slice(0, -1) : '0', 10);

  return hours > 0 || minutes > 0 || seconds >= 5;
};

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/clockify');
      setData(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error fetching data');
    } finally {
      setLoading(false);
    }
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
          <div className="grid gap-6 lg:grid-cols-2">
            {data.filter(entry => isDurationMoreThanFiveSeconds(entry.timeInterval.duration)).map((entry) => (
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
        )}
      </div>
    </main>
  );
}