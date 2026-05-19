export function cleanJsonResponse(text: string): string {
  // Remove any markdown formatting or extra text
  if (text.includes("```json")) {
    text = text.split("```json")[1].split("```")[0].trim()
  } else if (text.includes("```")) {
    text = text.split("```")[1].split("```")[0].trim()
  }

  // Remove any leading/trailing non-JSON text
  const jsonStart = text.indexOf("{")
  const jsonEnd = text.lastIndexOf("}")
  if (jsonStart !== -1 && jsonEnd !== -1) {
    text = text.substring(jsonStart, jsonEnd + 1)
  }

  return text
}

export function validateJsonStructure(text: string): { isValid: boolean; error?: string } {
  // Validate JSON structure
  if (!text.startsWith("{") || !text.endsWith("}")) {
    return { isValid: false, error: "Invalid JSON structure: missing opening or closing braces" }
  }

  // Count braces to ensure they're balanced
  const openBraces = (text.match(/\{/g) || []).length
  const closeBraces = (text.match(/\}/g) || []).length
  if (openBraces !== closeBraces) {
    return { isValid: false, error: `Unbalanced braces: ${openBraces} opening, ${closeBraces} closing` }
  }

  return { isValid: true }
}

export function parseJsonSafely<T>(text: string, fallback: T): T {
  try {
    const parsed = JSON.parse(text)
    return parsed as T
  } catch (error) {
    console.error("JSON parsing failed:", error)
    console.error("Attempted to parse:", text)
    return fallback
  }
}