'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

interface Submission {
  id: string;
  symptoms: string;
  age: string;
  gender: string;
  temperature: string;
  bloodPressure: string;
  imageUrl: string;
  analysis: any;
  timestamp: any;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const submissionsRef = collection(db, 'users', user?.uid!, 'submissions');
        const q = query(
          submissionsRef,
          where('symptoms', '>=', searchTerm),
          orderBy('timestamp', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const submissions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setSubmissions(submissions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSubmissions();
    }
  }, [user, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-200 text-green-800';
      case 'medium': return 'bg-yellow-200 text-yellow-800';
      case 'high': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Your Medical History</h1>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Search symptoms..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-2 border rounded"
        />
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="p-4 bg-white rounded-lg shadow"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold">{submission.symptoms}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(submission.timestamp?.toDate()).toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${getRiskColor(submission.analysis?.riskLevel || 'low')}`}>
                  {submission.analysis?.riskLevel || 'Low'} Risk
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Age:</strong> {submission.age}</p>
                  <p><strong>Gender:</strong> {submission.gender}</p>
                </div>
                <div>
                  <p><strong>Temp:</strong> {submission.temperature}°C</p>
                  <p><strong>BP:</strong> {submission.bloodPressure}</p>
                </div>
              </div>

              {submission.imageUrl && (
                <div className="mt-4">
                  <img
                    src={submission.imageUrl}
                    alt="Uploaded"
                    className="w-full rounded"
                  />
                </div>
              )}

              <div className="mt-4">
                <h4 className="font-semibold mb-2">Analysis:</h4>
                <p><strong>Condition:</strong> {submission.analysis?.condition}</p>
                <p><strong>Severity:</strong> {submission.analysis?.severity}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
