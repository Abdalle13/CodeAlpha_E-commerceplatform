import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Plus, Minus, RefreshCw, X, History,
} from 'lucide-react';
import {
  getInventoryMatrix,
  adjustInventory,
  getInventoryMovements,
} from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';

export const AdminInventoryPage = () => {
  const toast = useToast();
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Adjustment Modal
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [adjustDelta, setAdjustDelta] = useState(5);
  const [adjustReason, setAdjustReason] = useState('Stock shipment arrived at warehouse');
  const [adjusting, setAdjusting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [invRes, movRes] = await Promise.all([
      getInventoryMatrix(),
      getInventoryMovements(),
    ]);
    setInventory(invRes.data || []);
    setMovements(movRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdjust = (item) => {
    setSelectedVariant(item);
    setAdjustDelta(5);
    setAdjustReason('Stock shipment arrived at warehouse');
  };

  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedVariant) return;

    setAdjusting(true);
    const { data, error } = await adjustInventory({
      variantId: selectedVariant.variant_id || selectedVariant.id,
      delta: adjustDelta,
      reason: adjustReason,
    });

    if (!error) {
      toast.success(`Inventory for ${selectedVariant.sku} updated.`);
      setSelectedVariant(null);
      loadData();
    } else {
      toast.error(error.message || 'Adjustment failed');
    }
    setAdjusting(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-soft-beige">
        <div>
          <h1 className="font-serif text-2xl font-medium text-charcoal">Variant Inventory Matrix</h1>
          <p className="text-xs text-muted-text mt-0.5">
            Monitor real-time stock levels, low-stock warnings, and historical movement audit logs.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadData} className="gap-1.5 self-start">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Stock</span>
        </Button>
      </div>

      {/* Stock Matrix Table */}
      <div className="bg-white border border-soft-beige rounded-xs shadow-xs overflow-hidden">
        <div className="p-4 border-b border-soft-beige flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-muted-olive" />
            <span className="font-serif font-semibold text-xs text-charcoal uppercase tracking-wider-brand">
              Stock Levels by SKU
            </span>
          </div>
          <span className="text-[11px] text-muted-text">
            {inventory.length} variant SKUs tracked
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-muted-text">
            <div className="w-6 h-6 border-2 border-charcoal border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading stock matrix...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-warm-ivory border-b border-soft-beige text-[10px] uppercase tracking-wider-brand text-muted-text">
                <tr>
                  <th className="py-3 px-4 font-semibold">SKU Code</th>
                  <th className="py-3 px-4 font-semibold">Style Name</th>
                  <th className="py-3 px-4 font-semibold">Size</th>
                  <th className="py-3 px-4 font-semibold">Color</th>
                  <th className="py-3 px-4 font-semibold">Current Stock</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-beige">
                {inventory.map((item) => {
                  const isLow = Number(item.quantity) <= Number(item.low_stock_threshold || 5);
                  return (
                    <tr key={item.id || item.sku} className="hover:bg-warm-ivory/30 transition">
                      <td className="py-3 px-4 font-mono font-semibold text-charcoal">
                        {item.sku}
                      </td>
                      <td className="py-3 px-4 font-medium text-charcoal">
                        {item.product_name}
                      </td>
                      <td className="py-3 px-4 text-muted-text">{item.size}</td>
                      <td className="py-3 px-4 text-muted-text">{item.color}</td>
                      <td className="py-3 px-4">
                        <span className={`font-mono text-sm font-bold ${isLow ? 'text-rose-700' : 'text-charcoal'}`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isLow ? (
                          <Badge variant="charcoal" size="xs" className="bg-rose-50 text-rose-700 border-rose-200">
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="olive" size="xs">
                            In Stock
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => handleOpenAdjust(item)}
                        >
                          Adjust
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Movement Audit Trail Table */}
      <div className="bg-white border border-soft-beige rounded-xs shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-soft-beige">
          <History className="w-4 h-4 text-muted-olive" />
          <h2 className="font-serif text-base font-semibold text-charcoal">
            Recent Stock Movements & Reason Trail
          </h2>
        </div>

        {movements.length === 0 ? (
          <p className="text-xs text-muted-text py-4">No recent stock adjustments recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wider-brand text-muted-text border-b border-soft-beige">
                <tr>
                  <th className="pb-2 font-medium">Date & Time</th>
                  <th className="pb-2 font-medium">SKU</th>
                  <th className="pb-2 font-medium">Previous</th>
                  <th className="pb-2 font-medium">Change</th>
                  <th className="pb-2 font-medium">New Stock</th>
                  <th className="pb-2 font-medium">Reason Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-beige">
                {movements.map((mov) => (
                  <tr key={mov.id} className="py-2.5">
                    <td className="py-2 text-muted-text">{formatDate(mov.created_at)}</td>
                    <td className="py-2 font-mono font-medium text-charcoal">{mov.sku || 'Variant'}</td>
                    <td className="py-2 text-muted-text">{mov.previous_quantity}</td>
                    <td className="py-2 font-mono font-semibold">
                      <span className={mov.delta > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {mov.delta > 0 ? `+${mov.delta}` : mov.delta}
                      </span>
                    </td>
                    <td className="py-2 font-mono font-bold text-charcoal">{mov.new_quantity}</td>
                    <td className="py-2 text-muted-text text-[11px]">{mov.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      <AnimatePresence>
        {selectedVariant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-soft-beige rounded-xs shadow-xl max-w-md w-full p-6 space-y-5 text-charcoal"
            >
              <div className="flex items-center justify-between pb-3 border-b border-soft-beige">
                <h3 className="font-serif text-base font-semibold text-charcoal">
                  Adjust Inventory: {selectedVariant.sku}
                </h3>
                <button
                  onClick={() => setSelectedVariant(null)}
                  className="p-1 text-muted-text hover:text-charcoal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
                <div className="p-3 rounded-xs bg-warm-ivory border border-soft-beige flex justify-between items-center">
                  <span className="text-muted-text">Current Quantity:</span>
                  <span className="font-mono text-base font-bold text-charcoal">
                    {selectedVariant.quantity}
                  </span>
                </div>

                <div>
                  <label className="font-semibold block mb-1">
                    Stock Change Delta (+ to restock, - to write off)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      value={adjustDelta}
                      onChange={(e) => setAdjustDelta(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 border border-soft-beige rounded-xs bg-warm-ivory/50 focus:bg-white text-xs font-mono"
                    />
                    <div className="text-[11px] text-muted-text whitespace-nowrap">
                      New Total: <strong>{Math.max(0, selectedVariant.quantity + adjustDelta)}</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Audit Reason *</label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-2 border border-soft-beige rounded-xs bg-white text-xs mb-2"
                  >
                    <option value="Stock shipment arrived at warehouse">Vendor Shipment Arrived</option>
                    <option value="Stock damaged / written off">Damaged Item Written Off</option>
                    <option value="Inventory audit cycle count correction">Cycle Count Correction</option>
                    <option value="Customer return restocked">Customer Return Restocked</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-soft-beige flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedVariant(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={adjusting}
                  >
                    {adjusting ? 'Saving...' : 'Record Adjustment'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminInventoryPage;
