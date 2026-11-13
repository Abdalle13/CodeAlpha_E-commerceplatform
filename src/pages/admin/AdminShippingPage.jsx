import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Plus, Check, RefreshCw } from 'lucide-react';
import { getShippingZones } from '../../services/shippingService';
import { formatPrice } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';

export const AdminShippingPage = () => {
  const toast = useToast();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadZones = async () => {
    setLoading(true);
    const { data } = await getShippingZones();
    setZones(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadZones();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-soft-beige">
        <div>
          <h1 className="font-serif text-2xl font-medium text-charcoal">Shipping & Logistics Configuration</h1>
          <p className="text-xs text-muted-text mt-0.5">
            Geographic coverage zones and delivery courier fees across Somalia.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadZones} className="gap-1.5 self-start">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Zones</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zones.map((zone) => (
          <div
            key={zone.id || zone.name}
            className="bg-white border border-soft-beige rounded-xs p-5 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between pb-3 border-b border-soft-beige">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xs bg-warm-ivory border border-soft-beige">
                  <MapPin className="w-4 h-4 text-muted-olive" />
                </div>
                <div>
                  <h2 className="font-serif font-semibold text-sm text-charcoal">{zone.name}</h2>
                  <p className="text-[11px] text-muted-text">{zone.description || 'Active Somali delivery region'}</p>
                </div>
              </div>
              <Badge variant="olive" size="xs">Active Zone</Badge>
            </div>

            <div className="space-y-2.5 text-xs">
              <span className="font-semibold uppercase tracking-wider-brand text-[10px] text-muted-text block">
                Configured Courier Methods:
              </span>

              {(zone.methods || []).map((method) => (
                <div
                  key={method.id || method.name}
                  className="p-3 rounded-xs bg-warm-ivory border border-soft-beige flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-charcoal block">{method.name}</span>
                    <span className="text-[11px] text-muted-text">
                      Turnaround: {method.estimated_delivery_time || '1 to 2 business days'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-charcoal text-sm">
                    {formatPrice(method.fee)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminShippingPage;
