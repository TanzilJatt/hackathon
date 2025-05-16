'use client';

import { useState } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { analyzeSymptoms, analyzeImage } from '../../lib/ai';
import { db, storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default function SubmitPage() {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [temperature, setTemperature] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!symptoms.trim()) {
        throw new Error('Please describe your symptoms');
      }

      // Analyze symptoms
      const symptomAnalysis = await analyzeSymptoms(symptoms);

      // Analyze image if provided
      let imageUrl = '';
      if (image) {
        const storageRef = ref(storage, `images/${user?.uid}/${Date.now()}-${image.name}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }

      // Save to Firestore
      const submissionsRef = collection(db, 'users', user?.uid!, 'submissions');
      await addDoc(submissionsRef, {
        symptoms,
        age,
        gender,
        temperature,
        bloodPressure,
        imageUrl,
        analysis: symptomAnalysis,
        timestamp: Timestamp.now()
      });

      setAnalysis(symptomAnalysis);
      setSymptoms('');
      setAge('');
      setGender('');
      setTemperature('');
      setBloodPressure('');
      setImage(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Submit Your Symptoms</h1>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Symptoms</label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={4}
            className="w-full p-2 border rounded"
            placeholder="Describe your symptoms..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Temperature (°C)</label>
            <input
              type="number"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Blood Pressure (mmHg)</label>
            <input
              type="text"
              value={bloodPressure}
              onChange={(e) => setBloodPressure(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., 120/80"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Upload Image (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Submit'}
        </button>
      </form>

      {analysis && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-bold mb-4">Analysis Results</h2>
          <p><strong>Condition:</strong> {analysis.condition}</p>
          <p><strong>Severity:</strong> {analysis.severity}</p>
          <p><strong>Risk Level:</strong> {analysis.riskLevel}</p>
          <h3 className="text-lg font-semibold mt-4">Recommendations:</h3>
          <ul className="list-disc pl-5">
            {analysis.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
