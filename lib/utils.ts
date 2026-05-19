import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format NASA API date key (YYYYMMDD) to ISO date (YYYY-MM-DD)
 */
export function formatDate(dateKey: string): string {
  if (dateKey.length === 8) {
    return `${dateKey.substring(0, 4)}-${dateKey.substring(
      4,
      6
    )}-${dateKey.substring(6, 8)}`;
  }
  return dateKey;
}