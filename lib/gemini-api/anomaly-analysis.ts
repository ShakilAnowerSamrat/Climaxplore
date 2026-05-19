import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_MODEL } from './constants';
import { WeatherAnomalyResponse } from './types';
import { callOpenAI } from './openai-client';
import {
  cleanJsonResponse,
  parseJsonSafely,
  validateJsonStructure,
} from './utils';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeWeatherAnomalies(
  weatherData: any,
  historicalData: any[]
): Promise<WeatherAnomalyResponse> {
  try {
    const prompt = `
    As a NASA meteorological AI, analyze this weather data for anomalies:

    CURRENT CONDITIONS:
    ${JSON.stringify(weatherData, null, 2)}

    HISTORICAL CONTEXT (last 30 days):
    ${JSON.stringify(historicalData.slice(-30), null, 2)}

    Identify unusual patterns and respond ONLY with valid JSON:
    {
      "anomalies": [{"type": "temperature", "severity": "high", "description": "Detailed description"}],
      "explanation": "Technical explanation of patterns",
      "implications": "What this means for users",
      "confidence": "high"
    }

    Do not include any text before or after the JSON.
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

    console.log('[climaxplore] Raw anomaly response:', text);

    // Clean and validate the response
    text = cleanJsonResponse(text);
    const validation = validateJsonStructure(text);

    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Parse and validate the response
    const parsed = parseJsonSafely<any>(text, null);
    if (!parsed) {
      throw new Error('Failed to parse anomaly JSON');
    }

    console.log('[climaxplore] Successfully parsed anomaly JSON:', parsed);
    return parsed as WeatherAnomalyResponse;
  } catch (error) {
    console.error('Anomaly analysis error:', error);

    // Return fallback instead of throwing to prevent unhandled promise rejection
    return {
      anomalies: [],
      explanation: 'Unable to analyze weather anomalies at this time.',
      implications: '',
      confidence: 'low',
    };
  }
}