/**
 * shippingService.js
 * Retrieves shipping zones, methods, and delivery fees for Somalia.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const DEFAULT_SHIPPING_ZONES = [
  {
    id: 'zone-moga',
    name: 'Mogadishu Metropolitan',
    description: 'Hodan, Waberi, Hamar Weyne, Bondhere, Yaqshid, Wadajir and surrounding districts',
    methods: [
      {
        id: 'method-moga-std',
        name: 'Mogadishu Standard Delivery',
        fee: 3.0,
        estimated_delivery_time: '1 to 2 business days',
      },
      {
        id: 'method-moga-exp',
        name: 'Mogadishu Express Courier',
        fee: 5.0,
        estimated_delivery_time: 'Same day dispatch (orders before 2 PM)',
      },
    ],
  },
  {
    id: 'zone-somaliland',
    name: 'Somaliland Urban',
    description: 'Hargeisa, Borama, Berbera, and Burao',
    methods: [
      {
        id: 'method-somaliland-std',
        name: 'Somaliland Regional Courier',
        fee: 7.0,
        estimated_delivery_time: '2 to 4 business days',
      },
    ],
  },
  {
    id: 'zone-puntland',
    name: 'Puntland Hubs',
    description: 'Garowe, Bosaso, and Galkayo',
    methods: [
      {
        id: 'method-puntland-std',
        name: 'Puntland Regional Courier',
        fee: 8.0,
        estimated_delivery_time: '3 to 5 business days',
      },
    ],
  },
  {
    id: 'zone-south',
    name: 'Southern Centers',
    description: 'Kismayo, Baidoa, and regional centers',
    methods: [
      {
        id: 'method-south-std',
        name: 'Southern Regional Courier',
        fee: 8.0,
        estimated_delivery_time: '3 to 5 business days',
      },
    ],
  },
];

/**
 * Fetch all active shipping zones and their associated methods.
 */
export async function getShippingZones() {
  if (!isSupabaseConfigured) {
    return { data: DEFAULT_SHIPPING_ZONES, error: null };
  }

  try {
    const { data: zones, error: zoneError } = await supabase
      .from('shipping_zones')
      .select(`
        id, name, description, is_active,
        methods:shipping_methods(id, name, fee, estimated_delivery_time, is_active)
      `)
      .eq('is_active', true);

    if (zoneError || !zones || zones.length === 0) {
      return { data: DEFAULT_SHIPPING_ZONES, error: null };
    }

    // Filter active methods
    const formatted = zones.map((z) => ({
      ...z,
      methods: (z.methods || []).filter((m) => m.is_active),
    }));

    // If database zones have no methods configured yet, attach default methods
    const populated = formatted.map((z) => {
      if (!z.methods || z.methods.length === 0) {
        const fallback = DEFAULT_SHIPPING_ZONES.find((df) => df.name === z.name);
        return {
          ...z,
          methods: fallback ? fallback.methods : [
            {
              id: `method-${z.id}`,
              name: `${z.name} Standard Delivery`,
              fee: 5.0,
              estimated_delivery_time: '2 to 4 business days',
            },
          ],
        };
      }
      return z;
    });

    return { data: populated, error: null };
  } catch (err) {
    console.warn('[shippingService] Falling back to default zones:', err);
    return { data: DEFAULT_SHIPPING_ZONES, error: null };
  }
}

