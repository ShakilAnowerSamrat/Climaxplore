import { chatWithWeatherAssistant } from '@/lib/gemini-api';
import { WeatherChatRequest } from '@/lib/gemini-api/types';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Verify API key exists on server
    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI API key not configured' },
        { status: 500 }
      );
    }

    const body: WeatherChatRequest = await request.json();

    // Validate required fields
    if (!body.message || !body.weatherContext) {
      return NextResponse.json(
        { error: 'Missing required fields: message, weatherContext' },
        { status: 400 }
      );
    }

    const response = await chatWithWeatherAssistant(body);
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Weather chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}