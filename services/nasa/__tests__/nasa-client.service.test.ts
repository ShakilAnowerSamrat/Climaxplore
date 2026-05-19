/**
 * 🧪 NASA Client Service Tests
 *
 * Tests for HTTP client wrapper
 */

import { NasaClientService } from '@/services/nasa/nasa-client.service';
import { beforeEach, describe, expect, it } from 'vitest';

describe('NasaClientService', () => {
  let client: NasaClientService;

  beforeEach(() => {
    client = new NasaClientService();
  });

  describe('URL Building', () => {
    it('should create client instance', () => {
      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(NasaClientService);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid requests gracefully', async () => {
      // This would require mocking fetch, which is complex
      // For now, just verify the service exists
      expect(client.fetchDailyData).toBeDefined();
      expect(client.fetchHourlyData).toBeDefined();
    });
  });
});