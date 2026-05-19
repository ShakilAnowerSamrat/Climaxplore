/**
 * 🌍 NASA API Type Definitions
 *
 * Clean type definitions for NASA POWER API
 */

// ============================================================================
// TEMPORAL TYPES (Hourly, Daily, Monthly, Climatology)
// ============================================================================

export type TemporalType = 'hourly' | 'daily' | 'monthly' | 'climatology';

export type TimeStandard = 'UTC' | 'LST';

export type Community = 'AG' | 'RE' | 'SB';

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface BaseNasaRequest {
  latitude: number;
  longitude: number;
  parameters: string[];
  community?: Community;
  format?: 'JSON' | 'CSV' | 'NETCDF' | 'ASCII';
}

export interface HourlyRequest extends BaseNasaRequest {
  start: string; // YYYYMMDD
  end: string; // YYYYMMDD
  timeStandard?: TimeStandard;
}

export interface DailyRequest extends BaseNasaRequest {
  start: string; // YYYYMMDD
  end: string; // YYYYMMDD
}

export interface MonthlyRequest extends BaseNasaRequest {
  start: string; // YYYYMM
  end: string; // YYYYMM
}

export interface ClimatologyRequest extends BaseNasaRequest {
  // Climatology uses predefined periods
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface NasaApiResponse<T = any> {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  header: {
    title: string;
    api_version: string;
    sources: string[];
    fill_value: number;
  };
  parameters: {
    [key: string]: {
      units: string;
      [key: string]: any;
    };
  };
  properties: {
    parameter: T;
  };
  messages?: string[];
}

export interface HourlyData {
  [date: string]: {
    // YYYYMMDDHH format
    [hour: string]: number;
  };
}

export interface DailyData {
  [date: string]: number; // YYYYMMDD format
}

export interface MonthlyData {
  [month: string]: number; // YYYYMM format
}

export interface ClimatologyData {
  [month: string]: number; // Month number or 'ANN' for annual
}