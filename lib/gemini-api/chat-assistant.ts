import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_MODEL } from './constants';
import { WeatherChatRequest } from './types';
import { callOpenAI } from './openai-client';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function chatWithWeatherAssistant(
  request: WeatherChatRequest
): Promise<string> {
  try {
    const conversationContext =
      request.conversationHistory
        ?.map((msg) => `${msg.role}: ${msg.content}`)
        .join('\n') || '';

    const prompt = `
    You are ARIA (Atmospheric Risk Intelligence Assistant), a NASA-trained weather AI specializing in outdoor activity safety.

    CURRENT WEATHER CONTEXT:
    ${JSON.stringify(request.weatherContext, null, 2)}

    CONVERSATION HISTORY:
    ${conversationContext}

    USER QUESTION: ${request.message}

    Respond as ARIA with:
    - Authoritative but friendly tone
    - Specific, actionable advice
    - Reference to current weather data when relevant
    - Safety-first approach
    - NASA-level precision and reliability

    Keep responses concise but comprehensive (2-4 sentences).
    `;

    if (process.env.OPENAI_API_KEY) {
      return await callOpenAI(prompt, false);
    }

    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI chat error:', error);
    return "I'm experiencing technical difficulties. Please try again in a moment.";
  }
}