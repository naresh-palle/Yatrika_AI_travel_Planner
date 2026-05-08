import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
    }

    // Initialize the official Google Generative AI SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Dynamically fetch the list of available models for this specific API key to prevent 404 errors
    const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const modelsData = await modelsRes.json();
    const availableModels = modelsData.models
      ?.filter((m: any) => m.supportedGenerationMethods?.includes("generateContent") && m.name.includes("gemini"))
      .map((m: any) => m.name.replace('models/', '')) || [];

    if (availableModels.length === 0) {
      throw new Error("Your API key does not have access to any Gemini text generation models. Please ensure it is a valid Google AI Studio key.");
    }

    // Pick the first valid model (usually gemini-1.5-flash or similar)
    const model = genAI.getGenerativeModel({ model: availableModels[0] });

    // Generate the itinerary
    const result = await model.generateContent(prompt);
    const generatedText = result.response.text();
    
    // Return in the format the frontend expects (mimicking Claude's structure)
    return NextResponse.json({
      content: [{ text: generatedText }]
    });

  } catch (error: any) {
    console.error('Failed to generate itinerary:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
