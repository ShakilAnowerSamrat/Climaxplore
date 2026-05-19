import { analyzeWeatherAnomalies } from '@/lib/gemini-api';
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

    const body = await request.json();
    const { weatherData, historicalData } = body;

    if (!weatherData) {
      return NextResponse.json(
        { error: 'Missing required field: weatherData' },
        { status: 400 }
      );
    }

    const anomalies = await analyzeWeatherAnomalies(
      weatherData,
      historicalData || []
    );
    return NextResponse.json(anomalies);
  } catch (error) {
    console.error('Anomaly analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze anomalies' },
      { status: 500 }
    );
  }
}