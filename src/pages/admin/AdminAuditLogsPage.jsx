import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Filter, Search } from 'lucide-react';
import { getAuditLogs } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    const { data } = await getAuditLogs();
    setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.entity_type?.toLowerCase().includes(search.toLowerCase()) ||
      l.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-soft-beige">
        <div>
          <h1 className="font-serif text-2xl font-medium text-charcoal">Security & Operations Audit Trail</h1>
          <p className="text-xs text-muted-text mt-0.5">
            Tamper-evident log of administrative actions, price adjustments, inventory changes, and payment confirmations.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadLogs} className="gap-1.5 self-start">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit Logs</span>
        </Button>
      </div>

      <div className="bg-white border border-soft-beige rounded-xs p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-muted-text absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by action (e.g. STOCK_ADJUSTED, ORDER_VERIFIED)..."
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
            Loading audit records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-text space-y-2">
            <ShieldCheck className="w-8 h-8 text-muted-text/50 mx-auto" />
            <p className="font-medium text-charcoal">No audit log records match filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-warm-ivory border-b border-soft-beige text-[10px] uppercase tracking-wider-brand text-muted-text">
                <tr>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                  <th className="py-3 px-4 font-semibold">Entity</th>
                  <th className="py-3 px-4 font-semibold">User / Actor</th>
                  <th className="py-3 px-4 font-semibold">Details Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-beige font-mono text-[11px]">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-warm-ivory/30 transition">
                    <td className="py-2.5 px-4 text-muted-text whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-charcoal">
                      <Badge variant="olive" size="xs">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 capitalize text-muted-text font-sans">
                      {log.entity_type} <span className="text-[10px] text-muted-text/70">({log.entity_id})</span>
                    </td>
                    <td className="py-2.5 px-4 font-sans text-charcoal font-medium">
                      {log.user_email || 'admin@hilaara.so'}
                    </td>
                    <td className="py-2.5 px-4 text-muted-text truncate max-w-xs">
                      {JSON.stringify(log.details || log.payload || {})}
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

export default AdminAuditLogsPage;
