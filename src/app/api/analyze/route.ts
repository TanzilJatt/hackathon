import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Use a fallback API key for development
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

if (!openai.apiKey) {
  console.error('OpenAI API key not found. Please set OPENAI_API_KEY in your .env file.');
  throw new Error('OpenAI API key not configured');
}

export async function POST(request: Request) {
  if (!openai.apiKey) {
    console.warn('No OpenAI API key found. Please set OPENAI_API_KEY in your .env file.');
    return NextResponse.json(
      { error: 'OpenAI API key not configured. Please contact the administrator.' },
      { status: 500 }
    );
  }
  try {
    const { symptoms } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a medical symptom analyzer. Your goal is to understand the user's health condition like a real doctor would.  When the user describes their symptoms:\n\n1. Ask 2–3 clear and relevant follow-up questions based on the symptoms.\n   - These should help narrow down the possible condition.\n   - Example: \"How high is your fever?\", \"Do you have any rashes?\", \"Are you pregnant?\", etc.\n\n2. After asking follow-up questions, wait for the user to answer.\n\n3. Once you have enough detail:\n   - Give your best guess of the disease (only if you're at least 95% confident)\n   - Mention the **severity** (Mild, Moderate, Severe, Emergency)\n   - Give **simple recommendations** (e.g., take rest, drink water, visit a doctor)\n\n4. Always end by asking:\n   - \"Would you like to add more symptoms or details for better accuracy?\"\n\nOnly respond based on real medical reasoning. Do not guess or provide fake answers."
        },
        {
          role: "user",
          content: symptoms
        }
      ],
      temperature: 0.7
    });

    const response = completion.choices[0].message?.content;
    if (!response) throw new Error('No response from AI');

    // Return the raw response as is
    return NextResponse.json({ content: response });
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    return NextResponse.json(
      { error: 'Failed to analyze symptoms' },
      { status: 500 }
    );
  }
}
