import { generateActivityPlan } from '@/lib/gemini-api';
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
    const { weatherForecast, activities, userPreferences } = body;

    if (!weatherForecast || !activities) {
      return NextResponse.json(
        { error: 'Missing required fields: weatherForecast, activities' },
        { status: 400 }
      );
    }

    const plan = await generateActivityPlan(
      weatherForecast,
      activities,
      userPreferences || {}
    );
    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Activity plan API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate activity plan' },
      { status: 500 }
    );
  }
}