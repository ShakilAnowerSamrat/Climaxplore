/**
 * 🤖 OpenAI Client Helper
 *
 * Lightweight, zero-dependency wrapper for communicating with OpenAI's API.
 * Uses the custom configured model (e.g., gpt-5.4-nano).
 */

export async function callOpenAI(
  prompt: string,
  jsonMode: boolean = false
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-5.4-nano';

  if (!apiKey) {
    throw new Error('OpenAI API key is missing from environment variables');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  const body: any = {
    model: model,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  console.log(`[climaxplore] Requesting OpenAI [Model: ${model}] JSON mode: ${jsonMode}`);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[climaxplore] OpenAI API failed: ${response.status}`, errorText);
    throw new Error(`OpenAI API failed with status ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Received empty content from OpenAI response choices');
  }

  return content.trim();
}
