import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_MODEL } from './constants';
import { ActivityPlanResponse } from './types';
import { callOpenAI } from './openai-client';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateActivityPlan(
  weatherForecast: any[],
  activities: string[],
  userPreferences: any
): Promise<string | ActivityPlanResponse> {
  try {
    const prompt = `
    As ARIA, NASA's weather planning AI, create an optimal activity schedule:

    FORECAST DATA (next 5 days):
    ${JSON.stringify(weatherForecast, null, 2)}

    DESIRED ACTIVITIES:
    ${activities.join(', ')}

    USER PREFERENCES:
    ${JSON.stringify(userPreferences, null, 2)}

    Create a day-by-day plan with:
    1. Best time slots for each activity
    2. Weather-based reasoning
    3. Backup plans for poor conditions
    4. Safety considerations

    Format as JSON:
    {
      "dailyPlans": [
        {
          "date": "2025-01-01",
          "recommended": [{"activity": "hiking", "timeSlot": "morning", "reason": "..."}],
          "avoid": [{"activity": "cycling", "reason": "high winds expected"}],
          "backup": "Indoor climbing gym"
        }
      ],
      "overallStrategy": "Week-long planning summary"
    }
    `;

    let text = '';
    if (process.env.OPENAI_API_KEY) {
      text = await callOpenAI(prompt, true);
    } else {
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();
    }

    // Try to parse as JSON, if fails return as string
    try {
      return JSON.parse(text) as ActivityPlanResponse;
    } catch {
      return text;
    }
  } catch (error) {
    console.error('Activity planning error:', error);
    return 'Unable to generate activity plan at this time.';
  }
}