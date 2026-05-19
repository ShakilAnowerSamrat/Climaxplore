export function normalizeCoordinates(
  lat: number,
  lon: number
): { lat: number; lon: number } {
  // Normalize latitude to -90 to +90 range
  const normalizedLat = Math.max(-90, Math.min(90, lat));

  // Normalize longitude to -180 to +180 range
  let normalizedLon = ((lon + 180) % 360) - 180;
  if (normalizedLon <= -180) normalizedLon = 180;

  console.log(
    `[climaxplore] Coordinate normalization: input(${lat}, ${lon}) -> output(${normalizedLat}, ${normalizedLon})`
  );

  return { lat: normalizedLat, lon: normalizedLon };
}

export function validateCoordinates(lat: number, lon: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

// Helper functions for date manipulation and formatting
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function format(date: Date, formatString: string): string {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return formatString.replace('MMMM', month).replace('yyyy', year.toString());
}