import { generateWeatherInsights } from '@/lib/gemini-api';
import { WeatherInsightRequest } from '@/lib/gemini-api/types';
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

    const body: WeatherInsightRequest = await request.json();

    // Validate required fields
    if (!body.weatherData || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields: weatherData, location' },
        { status: 400 }
      );
    }

    const insights = await generateWeatherInsights(body);
    return NextResponse.json(insights);
  } catch (error) {
    console.error('Weather insights API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}