export interface SymptomAnalysis {
  content: string;
  condition: string;
  severity: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export async function analyzeSymptoms(symptoms: string): Promise<SymptomAnalysis> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symptoms }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze symptoms');
    }

    const analysis = await response.json();
    return analysis as SymptomAnalysis;
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    throw error;
  }
}

export async function analyzeImage(imageUrl: string): Promise<string> {
  try {
    // TODO: Implement image analysis using HuggingFace or Google Vision
    // This is a placeholder implementation
    return 'Image analysis pending implementation';
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}
