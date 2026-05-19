// Constants for Gemini API configuration
// IMPORTANT: API key is ONLY used on server-side in lib/gemini-api/* functions
// It is loaded from process.env.GEMINI_API_KEY during server initialization
// Never export the API key - it's only available on the server runtime

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5.4-nano';