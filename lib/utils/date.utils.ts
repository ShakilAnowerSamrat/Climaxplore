/**
 * 📅 Date Utilities
 *
 * Clean date manipulation helpers
 * Single responsibility: date formatting and calculations
 */

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(year: number, month: number, day: number): string {
  const mm = month.toString().padStart(2, '0');
  const dd = day.toString().padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/**
 * Format date as YYYYMMDD (NASA API format)
 */
export function formatNasaDate(
  year: number,
  month: number,
  day: number
): string {
  const mm = month.toString().padStart(2, '0');
  const dd = day.toString().padStart(2, '0');
  return `${year}${mm}${dd}`;
}

/**
 * Parse NASA date format (YYYYMMDD) to components
 */
export function parseNasaDate(dateStr: string): {
  year: number;
  month: number;
  day: number;
} {
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6));
  const day = parseInt(dateStr.substring(6, 8));
  return { year, month, day };
}

/**
 * Calculate date range for historical data
 */
export function calculateDateRange(years: number): {
  startDate: string;
  endDate: string;
} {
  const today = new Date();
  const endYear = today.getFullYear();
  const startYear = endYear - years + 1;

  return {
    startDate: formatNasaDate(startYear, 1, 1),
    endDate: formatNasaDate(endYear, 12, 31),
  };
}

/**
 * Get current year
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Check if date is in future
 */
export function isFutureDate(
  year: number,
  month: number,
  day: number
): boolean {
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}