import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_MODEL } from './constants';
import { WeatherInsightRequest, WeatherInsightResponse } from './types';
import { callOpenAI } from './openai-client';
import {
  cleanJsonResponse,
  parseJsonSafely,
  validateJsonStructure,
} from './utils';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateWeatherInsights(
  request: WeatherInsightRequest
): Promise<WeatherInsightResponse> {
  try {
    const prompt = `
    You are a NASA-trained meteorological AI assistant specializing in weather risk assessment for outdoor activities.

    WEATHER DATA:
    ${JSON.stringify(request.weatherData, null, 2)}

    USER PREFERENCES:
    ${JSON.stringify(request.userPreferences, null, 2)}

    ACTIVITY: ${request.activity || 'General outdoor activities'}
    LOCATION: ${request.location}

    Please provide a weather analysis with:
    1. A concise weather summary (2-3 sentences)
    2. Key risk factors and their severity (High/Medium/Low)
    3. Specific recommendations for the planned activity
    4. Alternative suggestions if conditions are unfavorable
    5. Any notable weather patterns or anomalies

    IMPORTANT: Respond ONLY with valid JSON in this exact format:
    {
      "summary": "Brief weather overview in 2-3 sentences",
      "riskFactors": [{"factor": "Temperature", "severity": "Medium", "explanation": "Detailed explanation"}],
      "recommendations": ["Specific actionable advice", "Another recommendation"],
      "alternatives": ["Alternative activity suggestions"],
      "patterns": "Notable weather patterns or trends"
    }

    Do not include any text before or after the JSON. Only return the JSON object.
    `;

    let text = '';
    if (process.env.OPENAI_API_KEY) {
      text = await callOpenAI(prompt, true);
    } else {
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text().trim();
    }

    console.log('[climaxplore] Raw AI response:', text);

    // Clean and validate the response
    text = cleanJsonResponse(text);
    const validation = validateJsonStructure(text);

    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    console.log('[climaxplore] Cleaned JSON text:', text);

    // Parse and validate the response
    const parsed = parseJsonSafely<any>(text, null);
    if (!parsed) {
      throw new Error('Failed to parse JSON response');
    }

    console.log('[climaxplore] Successfully parsed JSON:', parsed);

    // Validate required fields
    if (
      !parsed.summary ||
      !Array.isArray(parsed.riskFactors) ||
      !Array.isArray(parsed.recommendations)
    ) {
      throw new Error('Missing required fields in parsed JSON');
    }

    return parsed as WeatherInsightResponse;
  } catch (error) {
    console.error('Gemini API error:', error);

    // Return fallback instead of throwing to prevent unhandled promise rejection
    return {
      summary:
        'Unable to generate AI insights at this time due to API connectivity issues.',
      riskFactors: [],
      recommendations: ['Please check your internet connection and try again'],
      alternatives: [
        'Use manual weather assessment based on the displayed data',
      ],
      patterns: '',
    };
  }
}