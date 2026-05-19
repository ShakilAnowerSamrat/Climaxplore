/**
 * 🔒 Validation Utilities
 *
 * Clean, reusable validation functions
 * Single responsibility: validate input data
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate latitude (-90 to 90)
 */
export function validateLatitude(
  lat: number,
  fieldName: string = 'latitude'
): void {
  if (isNaN(lat) || lat < -90 || lat > 90) {
    throw new ValidationError(
      `Latitude must be between -90 and 90 degrees (got ${lat})`,
      fieldName
    );
  }
}

/**
 * Validate longitude (-180 to 180)
 */
export function validateLongitude(
  lon: number,
  fieldName: string = 'longitude'
): void {
  if (isNaN(lon) || lon < -180 || lon > 180) {
    throw new ValidationError(
      `Longitude must be between -180 and 180 degrees (got ${lon})`,
      fieldName
    );
  }
}

/**
 * Validate month (1-12)
 */
export function validateMonth(month: number): void {
  if (isNaN(month) || month < 1 || month > 12) {
    throw new ValidationError(
      `Month must be between 1 and 12 (got ${month})`,
      'month'
    );
  }
}

/**
 * Validate day (1-31, with month-specific checks)
 */
export function validateDay(day: number, month?: number): void {
  if (isNaN(day) || day < 1 || day > 31) {
    throw new ValidationError(
      `Day must be between 1 and 31 (got ${day})`,
      'day'
    );
  }

  // Month-specific validation
  if (month) {
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day > daysInMonth[month - 1]) {
      throw new ValidationError(`Invalid day ${day} for month ${month}`, 'day');
    }
  }
}

/**
 * Validate year range
 */
export function validateYears(
  years: number,
  min: number = 1,
  max: number = 50
): void {
  if (isNaN(years) || years < min || years > max) {
    throw new ValidationError(
      `Years must be between ${min} and ${max} (got ${years})`,
      'years'
    );
  }
}

/**
 * Validate date exists (Feb 30, etc.)
 */
export function validateDateExists(
  year: number,
  month: number,
  day: number
): void {
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new ValidationError(`Invalid date: ${year}-${month}-${day}`, 'date');
  }
}

/**
 * Validate date range for hourly API (2001-present + unlimited future for patterns)
 * NASA POWER provides historical patterns that can be used for any future date planning
 * No future date limit - users can plan years ahead using historical averages
 */
export function validateHourlyDateRange(
  startDate: string,
  endDate: string
): void {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const minDate = new Date('2001-01-01');

  // No max date limit! NASA historical patterns work for any future date
  // Users can plan 2, 5, 10 years ahead using 20-year historical averages

  if (start < minDate) {
    throw new ValidationError(
      `Hourly data only available from 2001-01-01 onwards`,
      'start_date'
    );
  }

  if (start > end) {
    throw new ValidationError(
      `Start date must be before end date`,
      'date_range'
    );
  }
}