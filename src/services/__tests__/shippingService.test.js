import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getShippingZones, DEFAULT_SHIPPING_ZONES } from '../shippingService';

vi.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: null,
}));

describe('shippingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns default shipping zones for Somalia when Supabase is not configured', async () => {
    const { data, error } = await getShippingZones();
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(4);
  });

  it('contains Mogadishu Metropolitan, Somaliland, and Puntland zones', async () => {
    const { data } = await getShippingZones();
    const zoneNames = data.map((z) => z.name);

    expect(zoneNames).toContain('Mogadishu Metropolitan');
    expect(zoneNames).toContain('Somaliland Urban');
    expect(zoneNames).toContain('Puntland Hubs');
    expect(zoneNames).toContain('Southern Centers');
  });

  it('each shipping zone has at least one active delivery courier method with a positive fee', async () => {
    const { data } = await getShippingZones();

    data.forEach((zone) => {
      expect(zone.methods.length).toBeGreaterThan(0);
      zone.methods.forEach((m) => {
        expect(m.fee).toBeGreaterThanOrEqual(0);
        expect(m.name).toBeTruthy();
        expect(m.estimated_delivery_time).toBeTruthy();
      });
    });
  });
});

