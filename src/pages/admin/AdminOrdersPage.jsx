import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Search, CheckCircle2, Clock, AlertTriangle,
  X, MapPin, Phone, Mail, Truck, DollarSign, RefreshCw, FileText,
} from 'lucide-react';
import {
  getAdminOrders,
  updateOrderStatus,
  verifyOrderPayment,
} from '../../services/adminService';
import { formatPrice, formatDate, formatSomaliPhone } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';

const STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'processing',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

export const AdminOrdersPage = () => {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [search, setSearch] = useState('');

  // Selected Order Drawer
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    const { data } = await getAdminOrders({
      status: statusFilter,
      paymentStatus: paymentFilter,
      search,
    });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, paymentFilter]);

  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);

    const { data, error } = await updateOrderStatus(selectedOrder.id, newStatus, statusNotes);
    if (!error) {
      toast.success(`Order ${selectedOrder.order_number} marked as ${newStatus}.`);
      setSelectedOrder((prev) => ({ ...prev, order_status: newStatus }));
      loadOrders();
    } else {
      toast.error(error.message || 'Failed to update order status');
    }
    setUpdatingStatus(false);
  };

  const handleVerifyPayment = async () => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);

    const { data, error } = await verifyOrderPayment(selectedOrder.id);
    if (!error) {
      toast.success(`Payment verified for ${selectedOrder.order_number}!`);
      setSelectedOrder((prev) => ({
        ...prev,
        payment_status: 'paid',
        order_status: 'confirmed',
      }));
      loadOrders();
    } else {
      toast.error(error.message || 'Payment verification failed');
    }
    setUpdatingStatus(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-soft-beige">
        <div>
          <h1 className="font-serif text-2xl font-medium text-charcoal">Order Fulfillment & Payments</h1>
          <p className="text-xs text-muted-text mt-0.5">
            Process nationwide deliveries across Somalia and verify mobile money transactions.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadOrders} className="gap-1.5 self-start">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-soft-beige rounded-xs p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-text absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order number or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
            className="w-full pl-9 pr-4 py-2 border border-soft-beige rounded-xs bg-warm-ivory/50 focus:bg-white text-xs focus:outline-none focus:border-charcoal"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-soft-beige rounded-xs bg-white text-xs"
          >
            <option value="">All Fulfillment Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st} className="capitalize">
                {st.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border border-soft-beige rounded-xs bg-white text-xs"
          >
            <option value="">All Payment Statuses</option>
            <option value="paid">Paid (Verified)</option>
            <option value="pending">Pending Mobile Transfer</option>
            <option value="awaiting_delivery_payment">Awaiting Pay on Delivery</option>
          </select>
        </div>
      </div>

      {/* Orders Master Table */}
      <div className="bg-white border border-soft-beige rounded-xs shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-muted-text">
            <div className="w-6 h-6 border-2 border-charcoal border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-text space-y-2">
            <ShoppingBag className="w-8 h-8 text-muted-text/50 mx-auto" />
            <p className="font-medium text-charcoal">No orders found</p>
            <p className="text-[11px]">Orders created by customers will appear in this fulfillment queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-warm-ivory border-b border-soft-beige text-[10px] uppercase tracking-wider-brand text-muted-text">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order Number</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Destination</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Payment</th>
                  <th className="py-3 px-4 font-semibold">Fulfillment</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-beige">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-warm-ivory/30 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-charcoal">
                      {ord.order_number}
                    </td>
                    <td className="py-3 px-4 text-muted-text">
                      {formatDate(ord.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-charcoal block">{ord.customer_name}</span>
                      <span className="text-[11px] text-muted-text">{ord.customer_phone}</span>
                    </td>
                    <td className="py-3 px-4 text-muted-text">
                      <span>{ord.shipping_city}</span>
                      <span className="block text-[10px]">{ord.shipping_district}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-charcoal">
                      {formatPrice(ord.total_amount)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={ord.payment_status === 'paid' ? 'olive' : 'charcoal'}
                        size="xs"
                        className={
                          ord.payment_status === 'paid'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }
                      >
                        {ord.payment_status?.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          ord.order_status === 'delivered' || ord.order_status === 'confirmed'
                            ? 'olive'
                            : 'charcoal'
                        }
                        size="xs"
                      >
                        {ord.order_status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => setSelectedOrder(ord)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Side Drawer / Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-charcoal/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, x: 200 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 200 }}
              className="bg-white border-l border-soft-beige h-full w-full max-w-xl p-6 shadow-2xl overflow-y-auto space-y-6 text-charcoal flex flex-col"
            >
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-soft-beige">
                <div>
                  <span className="text-[10px] uppercase tracking-wider-brand text-muted-olive font-semibold">
                    Order Inspection
                  </span>
                  <h2 className="font-mono text-lg font-bold text-charcoal">
                    {selectedOrder.order_number}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-xs hover:bg-soft-beige text-muted-text hover:text-charcoal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Management Box */}
              <div className="p-4 rounded-xs bg-warm-ivory border border-soft-beige space-y-3 text-xs">
                <span className="font-semibold block uppercase tracking-wider-brand text-[11px] text-charcoal">
                  Fulfillment Status Controller
                </span>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedOrder.order_status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updatingStatus}
                    className="flex-1 px-3 py-2 border border-soft-beige rounded-xs bg-white text-xs capitalize font-medium"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>

                  {selectedOrder.payment_status !== 'paid' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleVerifyPayment}
                      disabled={updatingStatus}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white shrink-0"
                    >
                      Verify Payment
                    </Button>
                  )}
                </div>

                <div className="text-[11px] text-muted-text flex items-center gap-2">
                  <span>Payment:</span>
                  <strong className="capitalize text-charcoal">
                    {selectedOrder.payment_status?.replace(/_/g, ' ')}
                  </strong>
                  <span>via {selectedOrder.payment_method?.replace(/_/g, ' ')}</span>
                </div>
              </div>

              {/* Customer & Delivery Details */}
              <div className="space-y-3 text-xs">
                <h3 className="font-semibold uppercase tracking-wider-brand text-[11px] text-muted-text border-b border-soft-beige pb-1">
                  Customer & Delivery Details
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-muted-text text-[10px] block">Customer Name</span>
                    <span className="font-semibold text-charcoal">{selectedOrder.customer_name}</span>
                    <span className="text-muted-text block">{selectedOrder.customer_phone}</span>
                    <span className="text-muted-text block">{selectedOrder.customer_email}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-muted-text text-[10px] block">Shipping Address</span>
                    <span className="font-semibold text-charcoal">{selectedOrder.shipping_city}, Somalia</span>
                    <span className="text-muted-text block">{selectedOrder.shipping_district}</span>
                    <span className="text-muted-text block">{selectedOrder.shipping_address}</span>
                  </div>
                </div>
              </div>

              {/* Purchased Line Items Snapshot */}
              <div className="space-y-3 text-xs flex-1">
                <h3 className="font-semibold uppercase tracking-wider-brand text-[11px] text-muted-text border-b border-soft-beige pb-1">
                  Itemized Order Snapshot
                </h3>

                <ul className="divide-y divide-soft-beige">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <li key={item.id || idx} className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-charcoal block">{item.product_name}</span>
                        <span className="text-[11px] text-muted-text">
                          Size: {item.variant_size || 'N/A'} • Color: {item.variant_color_name || 'Standard'} • Qty: {item.quantity}
                        </span>
                      </div>
                      <span className="font-medium text-charcoal font-mono">
                        {formatPrice(item.total_price || item.unit_price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="pt-3 border-t border-soft-beige space-y-1 text-right text-xs">
                  <div className="flex justify-between text-muted-text">
                    <span>Subtotal</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-text">
                    <span>Delivery Fee</span>
                    <span>{formatPrice(selectedOrder.delivery_fee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-charcoal text-sm pt-2 border-t border-soft-beige">
                    <span>Total Amount</span>
                    <span>{formatPrice(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-4 border-t border-soft-beige">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setSelectedOrder(null)}
                  className="w-full"
                >
                  Close Drawer
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrdersPage;
