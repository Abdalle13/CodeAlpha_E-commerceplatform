import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign, ShoppingBag, Clock, AlertTriangle, Package,
  ArrowRight, ArrowUpRight, CheckCircle2, TrendingUp, RefreshCw,
} from 'lucide-react';
import { getAdminOverview, getAdminOrders } from '../../services/adminService';
import { formatPrice, formatDate } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const AdminOverviewPage = () => {
  const [overview, setOverview] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [ovRes, ordRes] = await Promise.all([
      getAdminOverview(),
      getAdminOrders({ limit: 5 }),
    ]);

    setOverview(ovRes.data || {});
    setRecentOrders((ordRes.data || []).slice(0, 5));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-charcoal border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-wider-brand text-muted-text">Loading store metrics...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Paid Revenue',
      value: formatPrice(overview?.totalPaidRevenue || 0),
      subtitle: 'Verified orders only (excludes unpaid/cancelled)',
      icon: DollarSign,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Total Orders',
      value: overview?.totalOrders || 0,
      subtitle: `${overview?.pendingOrders || 0} currently pending fulfillment`,
      icon: ShoppingBag,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      label: 'Pending Orders',
      value: overview?.pendingOrders || 0,
      subtitle: 'Require courier dispatch & payment confirmation',
      icon: Clock,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      label: 'Low Stock Alerts',
      value: overview?.lowStockCount || 0,
      subtitle: 'SKUs at or below threshold',
      icon: AlertTriangle,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-soft-beige">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal">
            Store Performance & Operations
          </h1>
          <p className="text-xs text-muted-text mt-1">
            Real-time analytics directly computed from verified customer database records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={loadData} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
          <Link to="/admin/products">
            <Button variant="primary" size="sm" className="gap-1.5">
              <Package className="w-3.5 h-3.5" />
              <span>Manage Products</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-soft-beige rounded-xs p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider-brand text-muted-text">
                  {kpi.label}
                </span>
                <div className={`p-2 rounded-xs border ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-charcoal block">
                  {kpi.value}
                </span>
                <p className="text-[11px] text-muted-text mt-1 leading-tight">{kpi.subtitle}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Operational Highlights & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-soft-beige rounded-xs p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-soft-beige">
            <div className="space-y-0.5">
              <h2 className="font-serif text-base font-semibold text-charcoal">Recent Customer Orders</h2>
              <p className="text-[11px] text-muted-text">Latest orders awaiting or in fulfillment</p>
            </div>
            <Link to="/admin/orders" className="text-xs text-muted-olive hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-muted-text text-xs space-y-2">
              <ShoppingBag className="w-8 h-8 text-muted-text/50 mx-auto" />
              <p>No customer orders placed yet.</p>
              <p className="text-[11px]">Orders created on the storefront will appear here instantly.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-soft-beige text-[10px] uppercase tracking-wider-brand text-muted-text">
                    <th className="pb-2 font-medium">Order Number</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Payment</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft-beige">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-warm-ivory/40 transition">
                      <td className="py-3 font-mono font-semibold text-charcoal">
                        <Link to="/admin/orders" className="hover:text-muted-olive underline">
                          {ord.order_number}
                        </Link>
                      </td>
                      <td className="py-3 text-muted-text">
                        <span className="font-medium text-charcoal block">{ord.customer_name}</span>
                        <span className="text-[10px]">{ord.shipping_city}</span>
                      </td>
                      <td className="py-3 font-medium text-charcoal">
                        {formatPrice(ord.total_amount)}
                      </td>
                      <td className="py-3">
                        <span className="capitalize text-[11px] font-mono text-muted-text">
                          {ord.payment_method?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={
                            ord.order_status === 'confirmed' || ord.order_status === 'delivered'
                              ? 'olive'
                              : 'charcoal'
                          }
                          size="xs"
                        >
                          {ord.order_status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Catalog Status & Quick Actions (1 col) */}
        <div className="bg-white border border-soft-beige rounded-xs p-6 shadow-xs space-y-5">
          <div className="pb-3 border-b border-soft-beige space-y-0.5">
            <h2 className="font-serif text-base font-semibold text-charcoal">Catalog & Logistics</h2>
            <p className="text-[11px] text-muted-text">Merchandising overview</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xs bg-warm-ivory border border-soft-beige">
              <span className="text-muted-text">Published Styles</span>
              <span className="font-bold text-charcoal">
                {overview?.publishedCount || 0} / {overview?.catalogSize || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xs bg-warm-ivory border border-soft-beige">
              <span className="text-muted-text">Active Shipping Zones</span>
              <span className="font-bold text-charcoal">4 Zones (Somalia)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xs bg-warm-ivory border border-soft-beige">
              <span className="text-muted-text">Mobile Gateways</span>
              <span className="font-bold text-emerald-800">EVC, eDahab, ZAAD</span>
            </div>
          </div>

          <div className="pt-2 border-t border-soft-beige space-y-2">
            <Link to="/admin/inventory" className="block">
              <Button variant="secondary" size="sm" className="w-full justify-between">
                <span>View Low-Stock SKUs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link to="/admin/audit-logs" className="block">
              <Button variant="secondary" size="sm" className="w-full justify-between">
                <span>Inspect Audit Trail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
