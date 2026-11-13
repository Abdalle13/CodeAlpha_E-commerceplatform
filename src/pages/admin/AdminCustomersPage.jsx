import React, { useState, useEffect } from 'react';
import { Users, Search, ShoppingBag, Phone, Mail, Calendar, RefreshCw } from 'lucide-react';
import { getAdminCustomers } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    const { data } = await getAdminCustomers();
    setCustomers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-soft-beige">
        <div>
          <h1 className="font-serif text-2xl font-medium text-charcoal">Customer Directory</h1>
          <p className="text-xs text-muted-text mt-0.5">
            Registered customer accounts, contact numbers, and purchase activity.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadCustomers} className="gap-1.5 self-start">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="bg-white border border-soft-beige rounded-xs p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-muted-text absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-soft-beige rounded-xs bg-warm-ivory/50 focus:bg-white text-xs focus:outline-none focus:border-charcoal"
          />
        </div>
      </div>

      <div className="bg-white border border-soft-beige rounded-xs shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-muted-text">
            <div className="w-6 h-6 border-2 border-charcoal border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading customer directory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-text space-y-2">
            <Users className="w-8 h-8 text-muted-text/50 mx-auto" />
            <p className="font-medium text-charcoal">No registered customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-warm-ivory border-b border-soft-beige text-[10px] uppercase tracking-wider-brand text-muted-text">
                <tr>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Phone Number</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Joined Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Orders Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-beige">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-warm-ivory/30 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-soft-beige flex items-center justify-center font-bold text-charcoal text-xs">
                          {c.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <span className="font-semibold text-charcoal block">{c.full_name || 'Customer'}</span>
                          <span className="text-[10px] text-muted-text font-mono">{c.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-charcoal font-medium">
                      {c.phone || 'No phone recorded'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={c.role === 'admin' ? 'charcoal' : 'olive'} size="xs">
                        {c.role || 'customer'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-text">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-charcoal">
                      {c.orders_count || 1}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomersPage;
